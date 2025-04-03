import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { ChunkUploadResult } from '../dtos/chunk-upload-result.dto';
import { ChunkedFileInfo } from '../dtos/chunked-file-info.dto';
import { DirectoryMetadata } from '../dtos/directory-metadata.dto';
import { FileExportOptions } from '../dtos/file-export-options.dto';
import { FileListOptions } from '../dtos/file-list-options.dto';
import { FileListResponseDto } from '../dtos/file-list-response.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';
import { IFileService } from '../interfaces/file-service.interface';


@Injectable()
export abstract class BaseFileService implements IFileService {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly uploadDir: string;
  protected readonly baseUrl: string;
  
  constructor(uploadDir?: string, baseUrl?: string) {
    this.uploadDir = uploadDir || '';
    this.baseUrl = baseUrl || '';
  }
  abstract listFiles(options?: FileListOptions, authorization?: string): Promise<FileListResponseDto>;
  abstract createDirectory(dirPath: string): Promise<DirectoryMetadata>;
  abstract deleteDirectory(dirPath: string, recursive?: boolean): Promise<boolean>;
  abstract renameDirectory(oldPath: string, newPath: string): Promise<DirectoryMetadata>;

  abstract initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string>;
  abstract uploadChunk(uploadId: string, chunkNumber: number, chunk: Buffer): Promise<ChunkUploadResult>;
  abstract completeChunkedUpload(uploadId: string): Promise<FileMetadata>;

  // Abstract methods to be implemented by provider-specific services
  abstract uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata>;
  abstract uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]>;
  abstract getFileMetadata(fileKey: string, authorization?: string): Promise<FileMetadata>;
  abstract deleteFile(fileKey: string): Promise<boolean>;
  abstract fileExists(fileKey: string): Promise<boolean>;
  abstract getFileStream(fileKey: string): Promise<Readable>;
  abstract getFileBuffer(fileKey: string): Promise<Buffer>;
  abstract getFileUrl(fileKey: string, authorization?: string): Promise<string>;
  abstract getContentType(fileKey: string): Promise<string>;
  
  // Common implementable methods
  async streamFile(fileKey: string, res: Response, inline: boolean | null = null): Promise<void> {
    try {
      // Check if file exists first to handle 404 gracefully
      if (!(await this.fileExists(fileKey))) {
        res.status(404).send('File not found');
        return;
      }
  
      const contentType = await this.getContentType(fileKey);
      const metadata = await this.getFileMetadata(fileKey);
      const filename = path.basename(fileKey);
      const fileSize = metadata.size;
      const filePath = path.join(this.uploadDir, fileKey);

      // Auto-detect if inline should be true based on content type if not explicitly set
      if (inline === null) {
        inline = contentType.startsWith('video/') || 
                contentType.startsWith('audio/') || 
                contentType === 'application/pdf' || 
                contentType.startsWith('image/');
      }
  
      // Set common headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Set cache control based on file type
      if (contentType.startsWith('image/')) {
        // Cache images longer
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      } else if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
        // Streaming media cache
        res.setHeader('Cache-Control', 'public, max-age=3600');
      } else {
        // Default cache for documents and other files
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      }
  
      // Set content type and disposition
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(filename)}"`
      );
  
      // Get range header from request
      const range = res.req.headers.range;
      
      // Apply range requests for videos, audio, and large files
      const isRangeSupported = contentType.startsWith('video/') || 
                              contentType.startsWith('audio/') || 
                              contentType === 'application/pdf' ||
                              fileSize > 10 * 1024 * 1024; // 10MB+
      
      // If no range header or range not supported for this file type, send entire file
      if (!range || !isRangeSupported) {
        res.setHeader('Content-Length', fileSize);
        const stream = await this.getFileStream(fileKey);
        return new Promise<void>((resolve, reject) => {
          stream.pipe(res)
            .on('finish', () => resolve())
            .on('error', (err) => {
              this.logger.error(`Error streaming file: ${err.message}`, err.stack);
              reject(err);
            });
        });
      }
      
      // Handle range request
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Validate range request
      if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
        // Return 416 Range Not Satisfiable if range is invalid
        res.status(416);
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }
      
      const chunkSize = end - start + 1;
      
      // Set partial content headers
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);
      
      // Create read stream with range
      const stream = fs.createReadStream(filePath, { start, end });
      
      return new Promise<void>((resolve, reject) => {
        stream.pipe(res)
          .on('finish', () => resolve())
          .on('error', (err) => {
            this.logger.error(`Error streaming file range: ${err.message}`, err.stack);
            reject(err);
          });
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error streaming file: ${err.message}`, err.stack);
      
      // If headers haven't been sent yet, send appropriate error response
      if (!res.headersSent) {
        if (err.message?.includes('not found')) {
          res.status(404).send('File not found');
        } else {
          res.status(500).send('Error streaming file');
        }
      } else {
        // If headers were sent, just end the response
        res.end();
      }
      
      throw error;
    }
  }
  
  async downloadFile(fileKey: string, res: Response): Promise<void> {
    try {
      return this.streamFile(fileKey, res, false);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error downloading file: ${err.message}`, err.stack);
      throw error;
    }
  }

  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const sanitizedName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 40);
    
    return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
  }

  async exportToCsv(data: any[], options?: FileExportOptions): Promise<Buffer> {
    const columns = options?.columns || Object.keys(data[0] || {}).map(id => ({ id, title: id }));
    
    const csvStringifier = createObjectCsvStringifier({ header: columns });
    const headers = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(data);
    
    return Buffer.from(headers + records);
  }
  
  async exportToExcel(data: any[], options?: FileExportOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options?.sheetName || 'Data');
    
    const columns = options?.columns?.map(col => ({
      header: col.title,
      key: col.id,
      width: 15
    })) || Object.keys(data[0] || {}).map(id => ({ 
      header: id, 
      key: id, 
      width: 15 
    }));
    
    worksheet.columns = columns;
    
    if (options?.headerStyle) {
      worksheet.getRow(1).font = options.headerStyle;
    }
    
    data.forEach(item => {
      worksheet.addRow(item);
    });
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
  
  async exportToPdf(data: any[], options?: FileExportOptions): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
      const buffers: Buffer[] = [];
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        layout: options?.orientation || 'portrait'
      });
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      
      // Add title
      doc.fontSize(16).text(options?.filename || 'Data Export', {
        align: 'center'
      });
      doc.moveDown();
      
      // Create a simple table
      const columns = options?.columns || Object.keys(data[0] || {}).map(id => ({ id, title: id }));
      const tableTop = 150;
      const tableLeft = 50;
      let rowTop = tableTop;
      
      // Draw header
      doc.fontSize(12);
      columns.forEach((column, i) => {
        const leftPos = tableLeft + (i * 100);
        doc.font('Helvetica-Bold').text(column.title, leftPos, rowTop);
      });
      
      // Draw rows
      rowTop += 20;
      data.forEach(row => {
        columns.forEach((column, i) => {
          const leftPos = tableLeft + (i * 100);
          doc.font('Helvetica').text(String(row[column.id] || ''), leftPos, rowTop);
        });
        rowTop += 20;
        
        // Add new page if needed
        if (rowTop > 700) {
          doc.addPage();
          rowTop = 50;
        }
      });
      
      doc.end();
    });
  }
  /**
   * Validates file against size and type constraints
   * Utility method for implementations to use during upload operations
   */
  protected validateFile(file: Express.Multer.File, options?: FileUploadOptions): boolean {
    // Check file size if max size specified
    if (options?.maxSizeBytes && file.size > options.maxSizeBytes) {
      throw new Error(`File size exceeds the limit of ${options.maxSizeBytes} bytes`);
    }
    
    // Check file type if allowed types specified
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      const mimeType = options.contentType || file.mimetype;
      if (!options.allowedTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} not allowed`);
      }
    }
    
    return true;
  }
}