import { Response } from 'express';
import { Readable } from 'stream';
import { FileExportOptions } from '../dtos/file-export-options.dto';
import { FileListOptions } from '../dtos/file-list-options.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';

export interface IFileService {
  // Basic operations
  uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata>;
  uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]>;
  getFileMetadata(fileKey: string): Promise<FileMetadata>;
  deleteFile(fileKey: string): Promise<boolean>;
  fileExists(fileKey: string): Promise<boolean>;
  listFiles(options?: FileListOptions): Promise<FileMetadata[]>;

  // Chunked/resumable uploads for large files
  initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string>; // Returns uploadId
  uploadChunk(uploadId: string, chunkNumber: number, chunk: Buffer): Promise<ChunkUploadResult>;
  completeChunkedUpload(uploadId: string): Promise<FileMetadata>;

  // Streaming and downloading
  getFileStream(fileKey: string): Promise<Readable>;
  streamFile(fileKey: string, res: Response, inline?: boolean): Promise<void>;
  downloadFile(fileKey: string, res: Response, filename?: string): Promise<void>;
  getFileBuffer(fileKey: string): Promise<Buffer>;
  getFileUrl(fileKey: string, expiresIn?: number): Promise<string>;
  
  // Export operations
  exportToCsv(data: any[], options?: FileExportOptions): Promise<Buffer>;
  exportToExcel(data: any[], options?: FileExportOptions): Promise<Buffer>;
  exportToPdf(data: any[], options?: FileExportOptions): Promise<Buffer>;
  
  // Utilities
  generateUniqueFileName(originalName: string): string;
  getContentType(fileKey: string): Promise<string>;
}