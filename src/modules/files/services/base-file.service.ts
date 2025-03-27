import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { FileExportOptions } from '../dtos/file-export-options.dto';
import { FileListOptions } from '../dtos/file-list-options.dto';
import { FileMetadata } from '../dtos/file-meta-data.dto';
import { FileUploadOptions } from '../dtos/file-upload-options.dto';
import { IFileService } from '../interfaces/file-service.interface';


@Injectable()
export abstract class BaseFileService implements IFileService {
  protected readonly logger = new Logger(this.constructor.name);

  abstract initiateChunkedUpload(fileInfo: ChunkedFileInfo): Promise<string>;
  abstract uploadChunk(uploadId: string, chunkNumber: number, chunk: Buffer): Promise<ChunkUploadResult>;
  abstract completeChunkedUpload(uploadId: string): Promise<FileMetadata>;

  // Abstract methods to be implemented by provider-specific services
  abstract uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata>;
  abstract uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]>;
  abstract getFileMetadata(fileKey: string): Promise<FileMetadata>;
  abstract deleteFile(fileKey: string): Promise<boolean>;
  abstract fileExists(fileKey: string): Promise<boolean>;
  abstract listFiles(options?: FileListOptions): Promise<FileMetadata[]>;
  abstract getFileStream(fileKey: string): Promise<Readable>;
  abstract getFileBuffer(fileKey: string): Promise<Buffer>;
  abstract getFileUrl(fileKey: string, expiresIn?: number): Promise<string>;
  abstract getContentType(fileKey: string): Promise<string>;
  
  // Common implementable methods
  async streamFile(fileKey: string, res: Response, inline = false): Promise<void> {
    try {
      const contentType = await this.getContentType(fileKey);
      const metadata = await this.getFileMetadata(fileKey);
      const filename = path.basename(fileKey);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', metadata.size);
      res.setHeader(
        'Content-Disposition',
        `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(filename)}"`
      );

      const stream = await this.getFileStream(fileKey);
      return new Promise<void>((resolve, reject) => {
        stream.pipe(res)
          .on('finish', () => resolve())
          .on('error', (err) => reject(err));
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error streaming file: ${err.message}`, err.stack);
      throw error;
    }
  }
  
  async downloadFile(fileKey: string, res: Response, filename?: string): Promise<void> {
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