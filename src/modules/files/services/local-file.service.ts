import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';
import { ChunkUploadResult } from '../dtos/chunk-upload-result.dto';
import { ChunkedFileInfo } from '../dtos/chunked-file-info.dto';
import { DirectoryMetadata } from '../dtos/directory-metadata.dto';
import { FileListOptions, FileSortField, SortDirection } from '../dtos/file-list-options.dto';
import { FileListResponseDto } from '../dtos/file-list-response.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';
import { BaseFileService } from './base-file.service';


@Injectable()
export class LocalFileService extends BaseFileService {
  protected readonly uploadDir: string;
  protected readonly baseUrl: string;
  private readonly tempDir: string;
  private readonly metadataDir: string;
  private chunkUploads: Map<string, {
    info: ChunkedFileInfo;
    chunks: Set<number>;
    chunkPaths: string[];
  }> = new Map();

  constructor(
    private readonly configService: ConfigService,
  ) {
    const uploadDir = configService.getOrThrow('FILE_DIRECTORY');
    const baseUrl = configService.getOrThrow('FILE_BASE_URL');
    super(uploadDir, baseUrl);
    
    this.uploadDir = uploadDir; // Keep for backward compatibility
    this.baseUrl = baseUrl;     // Keep for backward compatibility
    this.tempDir = path.join(this.uploadDir, 'temp');
  
    // Ensure upload directories exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    // Create a dir for tracking upload metadata
    this.metadataDir = path.join(this.uploadDir, 'metadata');
    if (!fs.existsSync(this.metadataDir)) {
      fs.mkdirSync(this.metadataDir, { recursive: true });
    }
  }

  // Replace chunkUploads in-memory map with file-based storage
  async initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string> {
    try {
      const uploadId = crypto.randomUUID();
      
      // Store metadata in a file instead of memory
      const metadataPath = path.join(this.metadataDir, `${uploadId}.json`);
      await fsPromises.writeFile(metadataPath, JSON.stringify({
        info: fileInfo,
        chunks: [],
        chunkPaths: Array(fileInfo.totalChunks).fill(''),
        createdAt: new Date().toISOString()
      }));
      
      this.logger.log(`Initiated chunked upload ${uploadId} for ${fileInfo.filename}`);
      return uploadId;
    } catch (error) {
      throw error;
    }
  }

  // Update getChunkUploadData helper
  private async getChunkUploadData(uploadId: string): Promise<any> {
    const metadataPath = path.join(this.metadataDir, `${uploadId}.json`);
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Upload with ID ${uploadId} not found`);
    }
    
    const data = JSON.parse(await fsPromises.readFile(metadataPath, 'utf8'));
    // Convert chunks array back to Set for backwards compatibility
    data.chunks = new Set(data.chunks);
    return data;
  }

  // Update saveChunkUploadData helper
  private async saveChunkUploadData(uploadId: string, data: any): Promise<void> {
    const metadataPath = path.join(this.metadataDir, `${uploadId}.json`);
    // Convert Set back to array for storage
    const toSave = {
      ...data,
      chunks: Array.from(data.chunks)
    };
    await fsPromises.writeFile(metadataPath, JSON.stringify(toSave));
  }
  
  async uploadChunk(uploadId: string, chunkNumber: number, chunk: Buffer): Promise<ChunkUploadResult> {
    try {
      // Get upload tracking data
      const uploadData = this.chunkUploads.get(uploadId);
      if (!uploadData) {
        throw new Error(`Upload with ID ${uploadId} not found`);
      }
      
      // Validate chunk number
      if (chunkNumber < 0 || chunkNumber >= uploadData.info.totalChunks) {
        throw new Error(`Invalid chunk number ${chunkNumber}. Must be between 0 and ${uploadData.info.totalChunks - 1}`);
      }
      
      // Create a temporary file for this chunk
      const chunkFileName = `${uploadId}_chunk_${chunkNumber}`;
      const chunkPath = path.join(this.tempDir, chunkFileName);
      
      // Write the chunk to disk
      await fsPromises.writeFile(chunkPath, chunk);
      
      // Update tracking data
      uploadData.chunks.add(chunkNumber);
      uploadData.chunkPaths[chunkNumber] = chunkPath;
      
      // Prepare result
      const result: ChunkUploadResult = {
        uploadId,
        chunkNumber,
        receivedSize: chunk.length,
        totalChunksReceived: uploadData.chunks.size,
        completed: uploadData.chunks.size === uploadData.info.totalChunks
      };
      
      this.logger.log(`Received chunk ${chunkNumber} for upload ${uploadId} (${uploadData.chunks.size}/${uploadData.info.totalChunks})`);
      
      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error uploading chunk: ${err.message}`, err.stack);
      throw error;
    }
  }
  
  async completeChunkedUpload(uploadId: string): Promise<FileMetadata> {
    try {
      // Get upload tracking data
      const uploadData = this.chunkUploads.get(uploadId);
      if (!uploadData) {
        throw new Error(`Upload with ID ${uploadId} not found`);
      }
      
      // Verify all chunks have been received
      if (uploadData.chunks.size !== uploadData.info.totalChunks) {
        throw new Error(
          `Cannot complete upload: received ${uploadData.chunks.size} of ${uploadData.info.totalChunks} chunks`
        );
      }
      
      // Create target directory if needed
      const folder = uploadData.info.folder || '';
      const targetDir = path.join(this.uploadDir, folder);
      if (folder && !fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Generate final filename and path
      const fileName = this.generateUniqueFileName(uploadData.info.filename);
      const finalPath = path.join(targetDir, fileName);
      const fileKey = folder ? `${folder}/${fileName}` : fileName;
      
      // Combine chunks into the final file
      const writeStream = fs.createWriteStream(finalPath);
      
      // Process chunks in order
      for (let i = 0; i < uploadData.info.totalChunks; i++) {
        const chunkPath = uploadData.chunkPaths[i];
        if (!chunkPath) {
          throw new Error(`Missing chunk ${i} for upload ${uploadId}`);
        }
        
        // Read chunk and append to final file
        const chunkData = await fsPromises.readFile(chunkPath);
        writeStream.write(chunkData);
        
        // Delete temporary chunk file
        await fsPromises.unlink(chunkPath).catch(err => this.logger.warn(`Failed to delete chunk file: ${err.message}`));
      }
      
      // Close the write stream
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        writeStream.end();
      });
      
      // Get file stats
      const stats = await fsPromises.stat(finalPath);
      
      // Create metadata
      const metadata: FileMetadata = {
        key: fileKey,
        originalName: uploadData.info.filename,
        size: stats.size,
        mimeType: uploadData.info.mimeType,
        url: `${this.baseUrl}/${fileKey}`,
        createdAt: stats.birthtime,
        lastModified: stats.mtime,
        metadata: uploadData.info.metadata
      };
      
      // Clean up upload tracking data
      this.chunkUploads.delete(uploadId);
      
      this.logger.log(`Completed chunked upload ${uploadId}, created file ${fileKey}`);
      
      return metadata;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error completing chunked upload: ${err.message}`, err.stack);
      
      // Try to clean up any temporary files if possible
      try {
        const uploadData = this.chunkUploads.get(uploadId);
        if (uploadData) {
          for (const chunkPath of uploadData.chunkPaths) {
            if (chunkPath && fs.existsSync(chunkPath)) {
              await fsPromises.unlink(chunkPath).catch(() => {});
            }
          }
        }
      } catch {}
      
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata> {
    const folder = options?.folder || '';
    const finalDir = path.join(this.uploadDir, folder);
    
    // Create folder if it doesn't exist
    if (folder && !fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    const fileName = this.generateUniqueFileName(file.originalname);
    const filePath = path.join(finalDir, fileName);
    const fileKey = folder ? `${folder}/${fileName}` : fileName;

    // Write file
    await fsPromises.writeFile(filePath, file.buffer);
    
    // Get file stats
    const stats = await fsPromises.stat(filePath);

    const url = await this.getFileUrl(fileKey, options?.token);

    const metadata: FileMetadata = {
      key: fileKey,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url,
      createdAt: stats.birthtime,
      lastModified: stats.mtime,
      encoding: file.encoding,
      metadata: options?.metadata,
    };
    
    return metadata;
  }

  async uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]> {
    const results: FileMetadata[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }
    
    return results;
  }

  async getFileMetadata(fileKey: string, authorization?: string): Promise<FileMetadata> {
    const filePath = path.join(this.uploadDir, fileKey);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }
    
    const stats = await fsPromises.stat(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const originalName = path.basename(fileKey);

    const url = await this.getFileUrl(fileKey, authorization);
    
    return {
      key: fileKey,
      originalName,
      size: stats.size,
      mimeType,
      url,
      createdAt: stats.birthtime,
      lastModified: stats.mtime,
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, fileKey);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    await fsPromises.unlink(filePath);
    return true;
  }

  async fileExists(fileKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, fileKey);
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  async listFiles(options?: FileListOptions, authorization?: string): Promise<FileListResponseDto> {
    try {
      // Set default options
      const opts = {
        limit: 100,
        includeDirs: true,
        recursive: false,
        sortDirection: 'asc' as SortDirection,
        ...options
      };
  
      // Resolve base directory
      const baseDir = opts.prefix 
        ? path.join(this.uploadDir, opts.prefix) 
        : this.uploadDir;
      
      // Check if directory exists
      if (!fs.existsSync(baseDir)) {
        return {
          files: [],
          directories: [],
          count: 0,
          prefix: opts.prefix,
          hasMore: false,
          totalSize: 0,
        };
      }
  
      // Initialize result containers
      const files: FileMetadata[] = [];
      const directories: DirectoryMetadata[] = [];
      let totalSize = 0;
  
      // Helper function to check if file matches filters
      const matchesFilters = async (filePath: string, stats: fs.Stats): Promise<boolean> => {
        // Extension filter
        if (opts.extensions) {
          const fileExt = path.extname(filePath).toLowerCase().replace('.', '');
          const allowedExts = opts.extensions.split(',').map(e => e.trim().toLowerCase());
          if (!allowedExts.includes(fileExt)) return false;
        }
  
        // Size filter
        if (opts.size) {
          if (opts.size.min !== undefined && stats.size < opts.size.min) return false;
          if (opts.size.max !== undefined && stats.size > opts.size.max) return false;
        }
  
        // Create date filter
        if (opts.createdAt) {
          const createTime = stats.birthtime.getTime();
          if (opts.createdAt.from && createTime < new Date(opts.createdAt.from).getTime()) return false;
          if (opts.createdAt.to && createTime > new Date(opts.createdAt.to).getTime()) return false;
        }
  
        // Modified date filter
        if (opts.modifiedAt) {
          const modTime = stats.mtime.getTime();
          if (opts.modifiedAt.from && modTime < new Date(opts.modifiedAt.from).getTime()) return false;
          if (opts.modifiedAt.to && modTime > new Date(opts.modifiedAt.to).getTime()) return false;
        }
  
        // MIME type filter
        if (opts.mimeType) {
          const fileMime = mime.lookup(filePath) || 'application/octet-stream';
          if (!fileMime.includes(opts.mimeType)) return false;
        }
  
        // Text search filter
        if (opts.searchTerm) {
          const fileName = path.basename(filePath).toLowerCase();
          if (!fileName.includes(opts.searchTerm.toLowerCase())) return false;
        }
  
        return true;
      };
  
      // Function to process directory content
      const processDirectory = async (dirPath: string, relPath: string = ''): Promise<void> => {
        const items = await fsPromises.readdir(dirPath);
  
        // Process directories first
        if (opts.includeDirs) {
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fsPromises.stat(itemPath);
  
            if (stats.isDirectory()) {
              const dirRelPath = relPath ? `${relPath}/${item}` : item;
              const dirKey = opts.prefix ? `${opts.prefix}/${dirRelPath}` : dirRelPath;
  
              // Skip if this is the root of a recursive search
              if (dirPath === baseDir) {
                // Calculate directory size and item count (can be expensive for large dirs)
                let dirSize = 0;
                let itemCount = 0;
                
                try {
                  const dirItems = await fsPromises.readdir(itemPath);
                  itemCount = dirItems.length;
                  
                  // Optionally calculate directory size
                  // This can be expensive, so we might want to make it optional
                  if (opts.includeSizes) {
                    dirSize = await this.calculateDirectorySize(itemPath);
                  }
                } catch (err) {
                  const error = err as Error;
                  this.logger.warn(`Error reading directory ${dirKey}: ${error.message}`);
                }
  
                directories.push({
                  key: dirKey,
                  name: item,
                  createdAt: stats.birthtime,
                  lastModified: stats.mtime,
                  itemCount,
                  size: dirSize
                });
              }
  
              // If recursive, process subdirectories
              if (opts.recursive) {
                await processDirectory(itemPath, dirRelPath);
              }
            }
          }
        }
  
        // Process files
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = await fsPromises.stat(itemPath);
  
          if (stats.isFile()) {
            const fileRelPath = relPath ? `${relPath}/${item}` : item;
            const fileKey = opts.prefix ? `${opts.prefix}/${fileRelPath}` : fileRelPath;
  
            // Apply filters
            if (await matchesFilters(itemPath, stats)) {
              totalSize += stats.size;
  
              files.push({
                key: fileKey,
                originalName: item,
                size: stats.size,
                mimeType: mime.lookup(itemPath) || 'application/octet-stream',
                url: opts.includeUrls ? await this.getFileUrl(fileKey) : undefined,
                createdAt: stats.birthtime,
                lastModified: stats.mtime,
              });
            }
          }
        }
      };
  
      // Process main directory and all subdirectories if recursive
      await processDirectory(baseDir);
  
      // Generate breadcrumbs
      const breadcrumbs = [];
      if (opts.prefix) {
        const segments = opts.prefix.split('/');
        let currentPath = '';
        
        breadcrumbs.push({ name: 'Home', path: '' });
        
        for (let i = 0; i < segments.length; i++) {
          currentPath = currentPath ? `${currentPath}/${segments[i]}` : segments[i];
          breadcrumbs.push({
            name: segments[i],
            path: currentPath
          });
        }
      }
  
      // Calculate parent directory
      let parentDir = undefined;
      if (opts.prefix) {
        const segments = opts.prefix.split('/');
        segments.pop();
        parentDir = segments.join('/');
      }
  
      // Apply sorting
      const sortItems = (a: any, b: any) => {
        const direction = opts.sortDirection === SortDirection.DESC ? -1 : 1;
        
        switch(opts.sortBy) {
          case FileSortField.NAME:
            return a.originalName?.localeCompare(b.originalName || b.name) * direction;
          case FileSortField.SIZE:
            return ((a.size || 0) - (b.size || 0)) * direction;
          case FileSortField.DATE_CREATED:
            return (a.createdAt?.getTime() - b.createdAt?.getTime()) * direction;
          case FileSortField.DATE_MODIFIED:
            return (a.lastModified?.getTime() - b.lastModified?.getTime()) * direction;
          case FileSortField.TYPE:
            const aType = a.mimeType || '';
            const bType = b.mimeType || '';
            return aType.localeCompare(bType) * direction;
          default:
            return a.originalName?.localeCompare(b.originalName || b.name) * direction;
        }
      };
  
      // Sort files and directories
      files.sort(sortItems);
      directories.sort(sortItems);
  
      // Apply pagination
      let hasMore = false;
      let nextMarker = undefined;
      
      // Calculate actual limit considering marker-based pagination
      let startIdx = 0;
      const combinedItems = [...directories, ...files];
      
      if (opts.marker) {
        // Find the index after the marker
        startIdx = combinedItems.findIndex(item => 
          (item.key || '') === opts.marker
        ) + 1;
        
        if (startIdx <= 0) startIdx = 0;
      }
      
      // Slice the results based on pagination
      const endIdx = opts.limit ? startIdx + opts.limit : combinedItems.length;
      const paginatedItems = combinedItems.slice(startIdx, endIdx);
      
      // Calculate if there are more results and next marker
      hasMore = endIdx < combinedItems.length;
      
      if (hasMore && paginatedItems.length > 0) {
        nextMarker = paginatedItems[paginatedItems.length - 1].key;
      }
      
      // Separate files and directories again
      const paginatedFiles = paginatedItems
        .filter(item => 'originalName' in item) as FileMetadata[];
        
      const paginatedDirs = paginatedItems
        .filter(item => !('originalName' in item)) as DirectoryMetadata[];
  
      return {
        files: paginatedFiles,
        directories: opts.includeDirs ? paginatedDirs : undefined,
        count: paginatedFiles.length + (paginatedDirs?.length || 0),
        prefix: opts.prefix,
        hasMore,
        nextMarker,
        totalSize,
        parentDir,
        breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : undefined
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error listing files: ${err.message}`, err.stack);
      throw error;
    }
  }
  
  // Helper method to calculate directory size
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    
    const items = await fsPromises.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fsPromises.stat(itemPath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await this.calculateDirectorySize(itemPath);
      }
    }
    
    return totalSize;
  }

  async createDirectory(dirPath: string): Promise<DirectoryMetadata> {
    try {
      const fullPath = path.join(this.uploadDir, dirPath);
      
      if (fs.existsSync(fullPath)) {
        throw new Error(`Directory ${dirPath} already exists`);
      }
      
      await fsPromises.mkdir(fullPath, { recursive: true });
      
      const stats = await fsPromises.stat(fullPath);
      
      return {
        key: dirPath,
        name: path.basename(dirPath),
        createdAt: stats.birthtime,
        lastModified: stats.mtime,
        itemCount: 0,
        size: 0
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error creating directory: ${err.message}`, err.stack);
      throw error;
    }
  }
  
  async deleteDirectory(dirPath: string, recursive: boolean = false): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, dirPath);
      
      if (!fs.existsSync(fullPath)) {
        return false;
      }
      
      const stats = await fsPromises.stat(fullPath);
      
      if (!stats.isDirectory()) {
        throw new Error(`Path ${dirPath} is not a directory`);
      }
      
      // Check if directory is empty
      const items = await fsPromises.readdir(fullPath);
      
      if (items.length > 0 && !recursive) {
        throw new Error(`Directory ${dirPath} is not empty. Use recursive=true to delete anyway.`);
      }
      
      await fsPromises.rm(fullPath, { recursive, force: true });
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error deleting directory: ${err.message}`, err.stack);
      throw error;
    }
  }
  
  async renameDirectory(oldPath: string, newPath: string): Promise<DirectoryMetadata> {
    try {
      const oldFullPath = path.join(this.uploadDir, oldPath);
      const newFullPath = path.join(this.uploadDir, newPath);
      
      if (!fs.existsSync(oldFullPath)) {
        throw new Error(`Directory ${oldPath} does not exist`);
      }
      
      if (fs.existsSync(newFullPath)) {
        throw new Error(`Target directory ${newPath} already exists`);
      }
      
      const stats = await fsPromises.stat(oldFullPath);
      
      if (!stats.isDirectory()) {
        throw new Error(`Path ${oldPath} is not a directory`);
      }
      
      await fsPromises.rename(oldFullPath, newFullPath);
      
      const newStats = await fsPromises.stat(newFullPath);
      const items = await fsPromises.readdir(newFullPath);
      
      return {
        key: newPath,
        name: path.basename(newPath),
        createdAt: newStats.birthtime,
        lastModified: newStats.mtime,
        itemCount: items.length,
        size: await this.calculateDirectorySize(newFullPath)
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error renaming directory: ${err.message}`, err.stack);
      throw error;
    }
  }

  async getFileStream(fileKey: string): Promise<Readable> {
    const filePath = path.join(this.uploadDir, fileKey);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }
    
    return fs.createReadStream(filePath);
  }

  async getFileBuffer(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileKey);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }
    
    return fsPromises.readFile(filePath);
  }

  async getFileUrl(fileKey: string, authorization?: string): Promise<string> {
    // Local storage doesn't support presigned URLs with expiration
    // Just return a direct URL
    const encodedFileKey = encodeURIComponent(fileKey);
    const token = authorization?.replace(/^Bearer\s+/i, '') || '';
    return `${this.baseUrl}/${encodedFileKey}?token=${token}`;
  }

  async getContentType(fileKey: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileKey);
    return mime.lookup(filePath) || 'application/octet-stream';
  }
}