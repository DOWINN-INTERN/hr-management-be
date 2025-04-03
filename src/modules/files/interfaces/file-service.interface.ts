import { Response } from 'express';
import { Readable } from 'stream';
import { ChunkUploadResult } from '../dtos/chunk-upload-result.dto';
import { ChunkedFileInfo } from '../dtos/chunked-file-info.dto';
import { DirectoryMetadata } from '../dtos/directory-metadata.dto';
import { FileExportOptions } from '../dtos/file-export-options.dto';
import { FileListOptions } from '../dtos/file-list-options.dto';
import { FileListResponseDto } from '../dtos/file-list-response.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';

export interface IFileService {
  // Basic operations
  uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata>;
  uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]>;
  getFileMetadata(fileKey: string, authorization?: string): Promise<FileMetadata>;
  deleteFile(fileKey: string): Promise<boolean>;
  fileExists(fileKey: string): Promise<boolean>;

  // Directory operations
  listFiles(options?: FileListOptions, authorization?: string): Promise<FileListResponseDto>;
  createDirectory(dirPath: string): Promise<DirectoryMetadata>;
  deleteDirectory(dirPath: string, recursive?: boolean): Promise<boolean>;
  renameDirectory(oldPath: string, newPath: string): Promise<DirectoryMetadata>;
    

  // Chunked/resumable uploads for large files
  initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string>; // Returns uploadId
  uploadChunk(uploadId: string, chunkNumber: number, chunk: Buffer): Promise<ChunkUploadResult>;
  completeChunkedUpload(uploadId: string): Promise<FileMetadata>;

  // Streaming and downloading
  getFileStream(fileKey: string): Promise<Readable>;
  streamFile(fileKey: string, res: Response, inline?: boolean): Promise<void>;
  downloadFile(fileKey: string, res: Response, filename?: string): Promise<void>;
  getFileBuffer(fileKey: string): Promise<Buffer>;
  getFileUrl(fileKey: string, authorization?: string): Promise<string>;
  
  // Export operations
  exportToCsv(data: any[], options?: FileExportOptions): Promise<Buffer>;
  exportToExcel(data: any[], options?: FileExportOptions): Promise<Buffer>;
  exportToPdf(data: any[], options?: FileExportOptions): Promise<Buffer>;
  
  // Utilities
  generateUniqueFileName(originalName: string): string;
  getContentType(fileKey: string): Promise<string>;
}