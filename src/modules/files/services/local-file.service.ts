import { UtilityHelper } from '@/common/helpers/utility.helper';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';
import { ChunkUploadResult } from '../dtos/chunk-upload-result.dto';
import { ChunkedFileInfo } from '../dtos/chunked-file-info.dto';
import { DirectoryMetadata } from '../dtos/directory-metadata.dto';
import { FileListOptionsDto, FileSortField, SortDirection } from '../dtos/file-list-options.dto';
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
    try {
      // Validate file
      this.validateFile(file, options);

      const folder = options?.folder || '';
      
      // Ensure the folder path doesn't allow directory traversal
      const sanitizedFolder = folder
        .replace(/\.\./g, '') // Remove ..
        .replace(/^\/+/, '') // Remove leading slashes
        .replace(/\/+/g, '/') // Normalize multiple slashes
        .replace(/\/+$/, ''); // Remove trailing slashes

      const finalDir = path.join(this.uploadDir, sanitizedFolder);
      
      // Security check: ensure the final directory is within uploadDir
      const resolvedFinalDir = path.resolve(finalDir);
      const resolvedUploadDir = path.resolve(this.uploadDir);
      
      if (!resolvedFinalDir.startsWith(resolvedUploadDir)) {
        throw new Error('Invalid upload path: directory traversal detected');
      }
      
      // Create folder if it doesn't exist
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
        this.logger.log(`Created tenant directory: ${sanitizedFolder}`);
      }
      
      const fileName = this.generateUniqueFileName(file.originalname);
      const filePath = path.join(finalDir, fileName);
      const fileKey = sanitizedFolder ? `${sanitizedFolder}/${fileName}` : fileName;

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
        metadata: {
          ...options?.metadata,
        },
      };
      
      this.logger.log(`File uploaded to tenant directory: ${fileKey}`);
      return metadata;

    } catch (error) {
      this.logger.error(`Error uploading file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // TODO: Implement tenant scoping and separation
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

  
  
  async listFiles(options?: FileListOptionsDto, authorization?: string): Promise<FileListResponseDto> {
  try {
    // Set default options with proper typing
    const opts = {
      page: options?.page || 1,
      limit: options?.limit || 50,
      folder: options?.folder,
      includeDirs: options?.includeDirs ?? true,
      includeUrls: options?.includeUrls ?? true,
      sortBy: options?.sortBy || FileSortField.NAME,
      sortDirection: options?.sortDirection || SortDirection.ASC,
      searchTerm: options?.searchTerm,
      showHidden: options?.showHidden ?? false,
      scope: options?.scope,
      ...options
    };

    // Resolve base directory using 'folder' instead of 'prefix'
    const baseDir = opts.folder 
      ? path.join(this.uploadDir, opts.folder) 
      : this.uploadDir;
    
    // Check if directory exists
    if (!fs.existsSync(baseDir)) {
      return {
        files: [],
        directories: [],
        pagination: {
          page: opts.page,
          limit: opts.limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: undefined,
          previousPage: undefined,
          itemsPerPage: opts.limit
        },
        breadcrumbs: this.generateBreadcrumbs(opts.folder),
        parentDir: this.getParentDirectory(opts.folder),
        scope: opts.scope
      };
    }

    // Initialize result containers
    const files: FileMetadata[] = [];
    const directories: DirectoryMetadata[] = [];
    let totalSize = 0;

    // Helper function to check if file matches filters
    const matchesFilters = async (filePath: string, stats: fs.Stats, fileName: string): Promise<boolean> => {
      // Skip hidden files unless showHidden is true
      if (!opts.showHidden && fileName.startsWith('.')) {
        return false;
      }
      
      

      // Text search filter
      if (opts.searchTerm) {
        const lowerFileName = fileName.toLowerCase();
        const searchTerm = opts.searchTerm.toLowerCase();
        if (!lowerFileName.includes(searchTerm)) return false;
      }

      return true;
    };

    // Function to process directory content
    const processDirectory = async (dirPath: string, relPath: string = ''): Promise<void> => {
      // Read directory contents
      const items = await fsPromises.readdir(dirPath);

      // Process directories first
      if (opts.includeDirs) {
        for (const item of items) {
          // Skip hidden items if not showing hidden
          if (!opts.showHidden && item.startsWith('.')) {
            continue;
          }
          
          const itemPath = path.join(dirPath, item);
          
          try {
            const stats = await fsPromises.stat(itemPath);

            if (stats.isDirectory()) {
              const dirRelPath = relPath ? `${relPath}/${item}` : item;
              const dirKey = opts.folder ? `${opts.folder}/${dirRelPath}` : dirRelPath;

              // Only include directories at the current level (not recursive)
              if (dirPath === baseDir) {
                // Calculate directory size and item count
                let dirSize = 0;
                let itemCount = 0;
                
                try {
                  const dirItems = await fsPromises.readdir(itemPath);
                  itemCount = dirItems.length;
                  
                  dirSize = await this.calculateDirectorySize(itemPath, opts.showHidden);
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
            }
          } catch (err) {
            // Skip directories we can't access
            this.logger.warn(`Error processing directory ${itemPath}: ${(err as Error).message}`);
          }
        }
      }

      // Process files
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        try {
          const stats = await fsPromises.stat(itemPath);

          if (stats.isFile()) {
            const fileRelPath = relPath ? `${relPath}/${item}` : item;
            const fileKey = opts.folder ? `${opts.folder}/${fileRelPath}` : fileRelPath;

            // Apply filters
            if (await matchesFilters(itemPath, stats, item)) {
              totalSize += stats.size;

              files.push({
                key: fileKey,
                originalName: item,
                size: stats.size,
                mimeType: mime.lookup(itemPath) || 'application/octet-stream',
                url: opts.includeUrls ? await this.getFileUrl(fileKey, authorization) : undefined,
                createdAt: stats.birthtime,
                lastModified: stats.mtime,
              });
            }
          }
        } catch (err) {
          // Skip files we can't access
          this.logger.warn(`Error processing file ${itemPath}: ${(err as Error).message}`);
        }
      }
    };

    // Process main directory
    await processDirectory(baseDir);

    // Apply sorting with directories first
    const sortItems = (a: any, b: any) => {
      // Always sort directories before files
      const aIsDir = !('originalName' in a);
      const bIsDir = !('originalName' in b);
      
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      
      const direction = opts.sortDirection === SortDirection.DESC ? -1 : 1;
      
      switch(opts.sortBy) {
        case FileSortField.NAME:
          return (a.originalName || a.name).localeCompare(b.originalName || b.name) * direction;
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
          return (a.originalName || a.name).localeCompare(b.originalName || b.name) * direction;
      }
    };

    // Sort files and directories
    files.sort(sortItems);
    directories.sort(sortItems);
    
    // Generate combined results for pagination
    const combinedItems = [...directories, ...files];
    const totalItems = combinedItems.length;
    
    // Calculate pagination
    const page = opts.page;
    const limit = opts.limit;
    const totalPages = Math.ceil(totalItems / limit);
    const startIdx = (page - 1) * limit;
    const endIdx = Math.min(startIdx + limit, totalItems);
    
    // Slice the array based on pagination parameters
    const paginatedItems = combinedItems.slice(startIdx, endIdx);
    
    // Separate files and directories again
    const paginatedFiles = paginatedItems
      .filter(item => 'originalName' in item) as FileMetadata[];
      
    const paginatedDirs = paginatedItems
      .filter(item => !('originalName' in item)) as DirectoryMetadata[];
      
    // Build pagination response
    const pagination = {
      page,
      limit,
      totalCount: totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : undefined,
      previousPage: page > 1 ? page - 1 : undefined,
      itemsPerPage: limit
    };

    return {
      files: paginatedFiles,
      directories: paginatedDirs,
      pagination,
      parentDir: this.getParentDirectory(opts.folder),
      breadcrumbs: this.generateBreadcrumbs(opts.folder),
      scope: opts.scope
    };
  } catch (error) {
    const err = error as Error;
    this.logger.error(`Error listing files: ${err.message}`, err.stack);
    throw error;
  }
}

// Helper methods
private generateBreadcrumbs(folderPath?: string): Array<{ name: string; path: string }> {
  const breadcrumbs = [{ name: 'Home', path: '' }];
  
  if (folderPath) {
    const segments = folderPath.split('/');
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath = currentPath ? `${currentPath}/${segments[i]}` : segments[i];
      breadcrumbs.push({
        name: segments[i],
        path: currentPath
      });
    }
  }
  
  return breadcrumbs;
}

private getParentDirectory(folderPath?: string): string | undefined {
  if (!folderPath) return undefined;
  
  const segments = folderPath.split('/');
  segments.pop();
  return segments.length > 0 ? segments.join('/') : '';
}

// Improved directory size calculation with hidden file option
private async calculateDirectorySize(dirPath: string, includeHidden: boolean = false): Promise<number> {
  let totalSize = 0;
  
  try {
    const items = await fsPromises.readdir(dirPath);
    
    for (const item of items) {
      // Skip hidden files if not including them
      if (!includeHidden && item.startsWith('.')) {
        continue;
      }
      
      const itemPath = path.join(dirPath, item);
      
      try {
        const stats = await fsPromises.stat(itemPath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          totalSize += await this.calculateDirectorySize(itemPath, includeHidden);
        }
      } catch (err) {
        // Skip files we can't access
        this.logger.warn(`Error calculating size for ${itemPath}: ${(err as Error).message}`);
      }
    }
  } catch (err) {
    this.logger.warn(`Error reading directory ${dirPath}: ${(err as Error).message}`);
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

  async getFileStream(fileKey: string, options?: {
  scope?: any;
  tenantContext?: {
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
    userId?: string;
  };
  authorization?: string;
}): Promise<Readable> {
  try {
    // log scope and tentant conext
    this.logger.log(`getFileStream called with fileKey: ${fileKey}, scope: ${JSON.stringify(options?.scope)}, tenantContext: ${JSON.stringify(options?.tenantContext)}`);

    // Validate tenant access if scope and tenant context are provided
    if (options?.scope && options?.tenantContext) {
      const allowedTenantPath = UtilityHelper.validateAndGetTenantDirectory(
        options.scope,
        options.tenantContext
      );

      // log allowedTenantPath
      this.logger.log(`Allowed tenant path: ${allowedTenantPath}`);
      this.logger.log(`Validating file key: ${fileKey} against allowed tenant path: ${allowedTenantPath}`);
      
      // Validate the file key is within the allowed tenant directory
      if (!UtilityHelper.validateFilePath(fileKey, allowedTenantPath) && allowedTenantPath) {
        throw new ForbiddenException(`Access denied: File ${fileKey} is outside your allowed directory`);
      }
    }

    // Sanitize file key to prevent directory traversal
    const sanitizedFileKey = fileKey
      .replace(/\.\./g, '') // Remove ..
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+/g, '/'); // Normalize multiple slashes

    const filePath = path.join(this.uploadDir, sanitizedFileKey);
    
    // Additional security check: ensure the resolved path is within uploadDir
    const resolvedFilePath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(this.uploadDir);
    
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path: directory traversal detected');
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }

    // Verify it's actually a file and not a directory
    const stats = await fsPromises.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path ${fileKey} is not a file`);
    }
    
    this.logger.log(`Streaming file: ${sanitizedFileKey}`);
    return fs.createReadStream(filePath);
    
  } catch (error) {
    this.logger.error(`Error streaming file ${fileKey}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async getFileBuffer(fileKey: string, options?: {
  scope?: any;
  tenantContext?: {
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
    userId?: string;
  };
  authorization?: string;
}): Promise<Buffer> {
  try {
    // Validate tenant access if scope and tenant context are provided
    if (options?.scope && options?.tenantContext) {
      const allowedTenantPath = UtilityHelper.validateAndGetTenantDirectory(
        options.scope,
        options.tenantContext
      );
      
      // Validate the file key is within the allowed tenant directory
      if (!UtilityHelper.validateFilePath(fileKey, allowedTenantPath)) {
        throw new Error(`Access denied: File ${fileKey} is outside your allowed directory`);
      }
    }

    // Sanitize file key to prevent directory traversal
    const sanitizedFileKey = fileKey
      .replace(/\.\./g, '') // Remove ..
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+/g, '/'); // Normalize multiple slashes

    const filePath = path.join(this.uploadDir, sanitizedFileKey);
    
    // Additional security check: ensure the resolved path is within uploadDir
    const resolvedFilePath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(this.uploadDir);
    
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path: directory traversal detected');
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }

    // Verify it's actually a file and not a directory
    const stats = await fsPromises.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path ${fileKey} is not a file`);
    }
    
    this.logger.log(`Reading file buffer: ${sanitizedFileKey}`);
    return fsPromises.readFile(filePath);
    
  } catch (error) {
    this.logger.error(`Error reading file ${fileKey}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

  async getFileUrl(fileKey: string, authorization?: string): Promise<string> {
    // Local storage doesn't support presigned URLs with expiration
    // Just return a direct URL
    const encodedFileKey = fileKey;
    const token = authorization?.replace(/^Bearer\s+/i, '') || '';
    return `${this.baseUrl}/${encodedFileKey}?token=${token}`;
  }

  async getContentType(fileKey: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileKey);
    return mime.lookup(filePath) || 'application/octet-stream';
  }
}