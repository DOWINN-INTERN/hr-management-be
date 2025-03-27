import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';
import { FileListOptions } from '../dtos/file-list-options.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';
import { BaseFileService } from './base-file.service';


@Injectable()
export class LocalFileService extends BaseFileService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly tempDir: string;
  private chunkUploads: Map<string, {
    info: ChunkedFileInfo;
    chunks: Set<number>;
    chunkPaths: string[];
  }> = new Map();

  constructor(
    private readonly configService: ConfigService,
  ) {
    super();
    this.uploadDir = configService.getOrThrow('FILE_DIRECTORY');
    this.baseUrl = configService.getOrThrow('FILE_BASE_URL');
    this.tempDir = path.join(this.uploadDir, 'temp');
  
    // Ensure upload directories exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string> {
    try {
      // Generate a unique ID for this upload
      const uploadId = crypto.randomUUID();
      
      // Store upload info in memory
      // In a production app, this should be stored in a database
      this.chunkUploads.set(uploadId, {
        info: fileInfo,
        chunks: new Set<number>(),
        chunkPaths: Array(fileInfo.totalChunks).fill('')
      });
      
      this.logger.log(`Initiated chunked upload ${uploadId} for ${fileInfo.filename} (${fileInfo.totalChunks} chunks)`);
      
      return uploadId;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error initiating chunked upload: ${err.message}`, err.stack);
      throw error;
    }
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
    
    const fileName = options?.customFileName || this.generateUniqueFileName(file.originalname);
    const filePath = path.join(finalDir, fileName);
    const fileKey = folder ? `${folder}/${fileName}` : fileName;
    
    // Write file
    await fsPromises.writeFile(filePath, file.buffer);
    
    // Get file stats
    const stats = await fsPromises.stat(filePath);
    
    const metadata: FileMetadata = {
      key: fileKey,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url: `${this.baseUrl}/${fileKey}`,
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

  async getFileMetadata(fileKey: string): Promise<FileMetadata> {
    const filePath = path.join(this.uploadDir, fileKey);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileKey} not found`);
    }
    
    const stats = await fsPromises.stat(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const originalName = path.basename(fileKey);
    
    return {
      key: fileKey,
      originalName,
      size: stats.size,
      mimeType,
      url: `${this.baseUrl}/${fileKey}`,
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
    const filePath = path.join(this.uploadDir, fileKey);
    return fs.existsSync(filePath);
  }

  async listFiles(options?: FileListOptions): Promise<FileMetadata[]> {
    const dir = options?.prefix 
      ? path.join(this.uploadDir, options.prefix) 
      : this.uploadDir;
    
    if (!fs.existsSync(dir)) {
      return [];
    }
    
    const files = await fsPromises.readdir(dir);
    const results: FileMetadata[] = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fsPromises.stat(filePath);
      
      if (stats.isFile()) {
        const fileKey = options?.prefix ? `${options.prefix}/${file}` : file;
        
        results.push({
          key: fileKey,
          originalName: file,
          size: stats.size,
          mimeType: mime.lookup(filePath) || 'application/octet-stream',
          url: options?.includeUrls ? `${this.baseUrl}/${fileKey}` : undefined,
          createdAt: stats.birthtime,
          lastModified: stats.mtime,
        });
      }
    }
    
    // Sort if needed
    if (options?.sortBy) {
      results.sort((a, b) => {
        const direction = options.sortDirection === 'desc' ? -1 : 1;
        
        if (options.sortBy === 'name') {
          return a.originalName.localeCompare(b.originalName) * direction;
        } else {
          return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
        }
      });
    }
    
    return options?.limit ? results.slice(0, options.limit) : results;
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

  async getFileUrl(fileKey: string, expiresIn?: number): Promise<string> {
    // Local storage doesn't support presigned URLs with expiration
    // Just return a direct URL
    return `${this.baseUrl}/${fileKey}`;
  }

  async getContentType(fileKey: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileKey);
    return mime.lookup(filePath) || 'application/octet-stream';
  }
}