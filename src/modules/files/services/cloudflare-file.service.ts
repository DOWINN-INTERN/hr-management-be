// import {
//     DeleteObjectCommand,
//     GetObjectCommand,
//     HeadObjectCommand,
//     ListObjectsCommand,
//     PutObjectCommand,
//     S3Client
// } from '@aws-sdk/client-s3';
// import { Injectable } from '@nestjs/common';
// import { Readable } from 'stream';
// import { FileListOptions } from '../dtos/file-list-options.dto';
// import { FileMetadata } from '../dtos/file-meta-data.dto';
// import { FileUploadOptions } from '../dtos/file-upload-options.dto';
// import { BaseFileService } from './base-file.service';

// @Injectable()
// export class CloudflareFileService extends BaseFileService {
//   private s3Client: S3Client;
//   private bucketName: string;
//   private baseUrl: string;

//   constructor() {
//     super();
//     this.bucketName = process.env.R2_BUCKET_NAME || 'my-bucket';
//     this.baseUrl = process.env.R2_PUBLIC_URL || '';
    
//     this.s3Client = new S3Client({
//       region: 'auto',
//       endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//       credentials: {
//         accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
//         secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
//       }
//     });
//   }

//   async uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<FileMetadata> {
//     const prefix = options?.folder ? `${options.folder}/` : '';
//     const fileName = options?.customFileName || this.generateUniqueFileName(file.originalname);
//     const key = `${prefix}${fileName}`;
    
//     const metadata = options?.metadata || {};
    
//     const command = new PutObjectCommand({
//       Bucket: this.bucketName,
//       Key: key,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//       Metadata: Object.entries(metadata).reduce((acc, [k, v]) => {
//         acc[k] = v.toString();
//         return acc;
//       }, {} as Record<string, string>),
//     });
    
//     await this.s3Client.send(command);
    
//     return {
//       key,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       url: this.baseUrl ? `${this.baseUrl}/${key}` : undefined,
//       createdAt: new Date(),
//       bucket: this.bucketName,
//       encoding: file.encoding,
//       metadata: options?.metadata,
//     };
//   }

//   async uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<FileMetadata[]> {
//     const results: FileMetadata[] = [];
    
//     for (const file of files) {
//       const result = await this.uploadFile(file, options);
//       results.push(result);
//     }
    
//     return results;
//   }

//   async getFileMetadata(fileKey: string): Promise<FileMetadata> {
//     const command = new HeadObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileKey,
//     });
    
//     try {
//       const response = await this.s3Client.send(command);
      
//       return {
//         key: fileKey,
//         originalName: this.getOriginalNameFromKey(fileKey),
//         size: response.ContentLength || 0,
//         mimeType: response.ContentType || 'application/octet-stream',
//         url: this.baseUrl ? `${this.baseUrl}/${fileKey}` : undefined,
//         createdAt: response.LastModified || new Date(),
//         lastModified: response.LastModified,
//         eTag: response.ETag,
//         bucket: this.bucketName,
//         metadata: response.Metadata,
//       };
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`File ${fileKey} not found: ${error.message}`);
//       } else {
//         throw new Error(`File ${fileKey} not found: Unknown error`);
//       }
//     }
//   }

//   async deleteFile(fileKey: string): Promise<boolean> {
//     const command = new DeleteObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileKey,
//     });
    
//     try {
//       await this.s3Client.send(command);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   async fileExists(fileKey: string): Promise<boolean> {
//     try {
//       await this.getFileMetadata(fileKey);
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   async listFiles(options?: FileListOptions): Promise<FileMetadata[]> {
//     const command = new ListObjectsCommand({
//       Bucket: this.bucketName,
//       Prefix: options?.prefix,
//       Marker: options?.marker,
//       MaxKeys: options?.limit,
//     });
    
//     try {
//       const response = await this.s3Client.send(command);
      
//       const files = response.Contents || [];
//       const results: FileMetadata[] = [];
      
//       for (const file of files) {
//         results.push({
//           key: file.Key || '',
//           originalName: this.getOriginalNameFromKey(file.Key || ''),
//           size: file.Size || 0,
//           mimeType: await this.getContentType(file.Key || ''),
//           url: options?.includeUrls ? (this.baseUrl ? `${this.baseUrl}/${file.Key}` : undefined) : undefined,
//           createdAt: file.LastModified || new Date(),
//           lastModified: file.LastModified,
//           eTag: file.ETag,
//           bucket: this.bucketName,
//         });
//       }
      
//       // Sort if needed
//       if (options?.sortBy) {
//         results.sort((a, b) => {
//           const direction = options.sortDirection === 'desc' ? -1 : 1;
          
//           if (options.sortBy === 'name') {
//             return a.originalName.localeCompare(b.originalName) * direction;
//           } else {
//             return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
//           }
//         });
//       }
      
//       return results;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to list files: ${error.message}`);
//       } else {
//         throw new Error('Failed to list files: Unknown error');
//       }
//     }
//   }

//   async getFileStream(fileKey: string): Promise<Readable> {
//     const command = new GetObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileKey,
//     });
    
//     try {
//       const response = await this.s3Client.send(command);
//       if (!response.Body) {
//         throw new Error(`File ${fileKey} has no content`);
//       }
//       return response.Body as Readable;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to get file stream: ${error.message}`);
//       } else {
//         throw new Error('Failed to get file stream: Unknown error');
//       }
//     }
//   }

//   async getFileBuffer(fileKey: string): Promise<Buffer> {
//     const command = new GetObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileKey,
//     });
    
//     try {
//       const response = await this.s3Client.send(command);
//       if (!response.Body) {
//         throw new Error(`File ${fileKey} has no content`);
//       }
      
//       return Buffer.from(await response.Body.transformToByteArray());
//     } catch (error) {
//       throw new Error(`Failed to get file buffer: ${error.message}`);
//     }
//   }

//   async getFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
//     // If we have a public URL configured, use that instead of signed URL
//     if (this.baseUrl) {
//       return `${this.baseUrl}/${fileKey}`;
//     }
    
//     const command = new GetObjectCommand({
//       Bucket: this.bucketName,
//       Key: fileKey,
//     });
    
//     return getSignedUrl(this.s3Client, command, { expiresIn });
//   }

//   async getContentType(fileKey: string): Promise<string> {
//     try {
//       const metadata = await this.getFileMetadata(fileKey);
//       return metadata.mimeType;
//     } catch {
//       // If we can't get the metadata, guess from the extension
//       const ext = fileKey.split('.').pop() || '';
//       const types: Record<string, string> = {
//         'png': 'image/png',
//         'jpg': 'image/jpeg',
//         'jpeg': 'image/jpeg',
//         'gif': 'image/gif',
//         'webp': 'image/webp',
//         'pdf': 'application/pdf',
//         'doc': 'application/msword',
//         'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'xls': 'application/vnd.ms-excel',
//         'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'csv': 'text/csv',
//       };
      
//       return types[ext.toLowerCase()] || 'application/octet-stream';
//     }
//   }
  
//   private getOriginalNameFromKey(key: string): string {
//     return key.split('/').pop() || key;
//   }
// }