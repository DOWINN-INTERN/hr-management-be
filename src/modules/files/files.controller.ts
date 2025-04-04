import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Version,
  VERSION_NEUTRAL
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FILE_SERVICE } from './config/file-provider.config';
import { DirectoryMetadata } from './dtos/directory-metadata.dto';
import { FileListOptions, FileSortField, SortDirection } from './dtos/file-list-options.dto';
import { FileListResponseDto } from './dtos/file-list-response.dto';
import { FileMetadata } from './dtos/file-meta-data.dto';
import { IFileService } from './interfaces/file-service.interface';

  @ApiTags('Files')
  @Controller('files')
  export class FilesController {
    private readonly logger = new Logger(FilesController.name);
    constructor(
        @Inject(FILE_SERVICE)
        private readonly fileService: IFileService
    ) {}
  
    @Post('upload')
    @Authorize()
    @ApiOperation({ summary: 'Upload a single file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload'
          }
        }
      }
    })
    @ApiResponse({
      status: 201,
      description: 'File uploaded successfully',
      type: FileMetadata
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request,
      @Query('folder') folder?: string,
      @CurrentUser('sub') userId?: string,
    ): Promise<FileMetadata> {
      if (!file) {
        throw new BadRequestException('No file provided');
      }
  
      try {
        const authorization = req.headers.authorization;
        this.logger.debug(`Authorization header: ${authorization}`);
        return await this.fileService.uploadFile(file, {
          folder,
          token: authorization,
          metadata: { uploadedBy: userId || 'anonymous' }
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(`File upload failed: ${error.message}`);
        }
        throw new BadRequestException('File upload failed');
      }
    }
  
    @Post('upload-multiple')
    @Authorize()
    @ApiOperation({ summary: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Files to upload (max 10)'
          }
        }
      }
    })
    @ApiResponse({
      status: 201,
      description: 'Files uploaded successfully',
      type: [FileMetadata]
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(
      @UploadedFiles() files: Express.Multer.File[],
      @Req() req: Request,
      @Query('folder') folder?: string,
      @CurrentUser('sub') userId?: string,
    ): Promise<FileMetadata[]> {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }
  
      try {
        const authorization = req.headers.authorization;
        return await this.fileService.uploadFiles(files, {
          folder,
          token: authorization,
          metadata: { uploadedBy: userId || 'anonymous' }
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(`Files upload failed: ${error.message}`);
        }
        throw new BadRequestException('Files upload failed');
      }
    }
  
    @Get('metadata/:key')
    @Authorize()
    @ApiOperation({ summary: 'Get file metadata' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({
      status: 200,
      description: 'File metadata retrieved successfully',
      type: FileMetadata
    })
    @ApiResponse({ status: 404, description: 'File not found' })
    async getFileMetadata(@Param('key') key: string, @Req() request: Request): Promise<FileMetadata> {
      try {
        const authorization = request.headers.authorization;
        return await this.fileService.getFileMetadata(key, authorization);
      } catch (error) {
        throw new NotFoundException(`File not found: ${key}`);
      }
    }
  
    @Get('download/:key')
    @Authorize()
    @ApiOperation({ summary: 'Download a file' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({ status: 200, description: 'File download' })
    @ApiResponse({ status: 404, description: 'File not found' })
    async downloadFile(
      @Param('key') key: string,
      @Res() res: Response
    ): Promise<void> {
      try {
        await this.fileService.downloadFile(key, res);
      } catch (error) {
        throw new NotFoundException(`File not found: ${key}`);
      }
    }
  
    @Get('stream/:key')
    @Authorize()
    @ApiOperation({ summary: 'Stream a file (for browser viewing)' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({ status: 200, description: 'File stream' })
    @ApiResponse({ status: 404, description: 'File not found' })
    // This properly disables all interceptors for this route
    @UseInterceptors()
    // Important! Add this to bypass global interceptors
    @Version(VERSION_NEUTRAL)
    async streamFile(@Param('key') key: string, @Res({ passthrough: false }) res: Response): Promise<void> {
        try {
            // Check if file exists first before starting to stream
            if (!(await this.fileService.fileExists(key))) {
                res.status(404).send(`File not found: ${key}`);
                return;
            }
            
            // Stream the file - no try/catch here to prevent header modifications after streaming
            await this.fileService.streamFile(key, res, true);
        } catch (error) {
            // Only set status and send error if headers haven't been sent yet
            if (!res.headersSent) {
            res.status(500).send('Error streaming file');
            }
        }
    }
  
    @Get('url/:key')
    @Authorize()
    @ApiOperation({ summary: 'Get a temporary URL for a file with user current token' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({
      status: 200,
      description: 'File URL',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string' }
        }
      }
    })
    async getFileUrl(
      @Param('key') key: string,
      @Req() req: Request,
    ): Promise<{ url: string }> {
      try {
        const authorization = req.headers.authorization;
        const url = await this.fileService.getFileUrl(key, authorization);
        return { url };
      } catch (error) {
        throw new NotFoundException(`File not found: ${key}`);
      }
    }
  
    @Get('list')
    @Authorize()
    @ApiOperation({ summary: 'List files and directories' })
    @ApiQuery({
        name: 'prefix',
        required: false,
        description: 'Directory path to list files from'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of items to return'
    })
    @ApiQuery({
        name: 'marker',
        required: false,
        description: 'Pagination marker/cursor for fetching next page'
    })
    @ApiQuery({
        name: 'includeUrls',
        required: false,
        type: Boolean,
        description: 'Whether to include file URLs in response'
    })
    @ApiQuery({
        name: 'includeDirs',
        required: false,
        type: Boolean,
        description: 'Whether to include directories in results'
    })
    @ApiQuery({
        name: 'includeSizes',
        required: false,
        type: Boolean,
        description: 'Whether to include file sizes in response'
    })
    @ApiQuery({
        name: 'recursive',
        required: false,
        type: Boolean,
        description: 'Whether to recursively list files in subdirectories'
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        enum: ['name', 'size', 'createdAt', 'lastModified', 'mimeType'],
        description: 'Field to sort by'
    })
    @ApiQuery({
        name: 'sortDirection',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Sort direction (asc or desc)'
    })
    @ApiQuery({
        name: 'searchTerm',
        required: false,
        description: 'Filter files by filename search term'
    })
    @ApiQuery({
        name: 'extensions',
        required: false,
        description: 'Filter by file extensions (comma-separated)'
    })
    @ApiResponse({
        status: 200,
        description: 'Files and directories listed successfully',
        type: FileListResponseDto
    })
    async listFiles(
        @Req() req: Request,
        @Query('prefix') prefix?: string,
        @Query('limit') limit?: number,
        @Query('marker') marker?: string,
        @Query('includeUrls') includeUrls?: boolean,
        @Query('includeDirs') includeDirs?: boolean,
        @Query('includeSizes') includeSizes?: boolean,
        @Query('recursive') recursive?: boolean,
        @Query('sortBy') sortBy?: 'name' | 'size' | 'createdAt' | 'lastModified' | 'mimeType',
        @Query('sortDirection') sortDirection?: 'asc' | 'desc',
        @Query('searchTerm') searchTerm?: string,
        @Query('extensions') extensions?: string
    ): Promise<FileListResponseDto> {
        // Transform boolean strings to actual booleans
        const boolFromString = (val: any) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return val === true;
        };

        const options: FileListOptions = {
            prefix,
            limit: limit ? parseInt(String(limit), 10) : undefined,
            marker,
            includeUrls: boolFromString(includeUrls),
            includeDirs: includeDirs !== undefined ? boolFromString(includeDirs) : true,
            recursive: boolFromString(recursive),
            sortBy: sortBy as FileSortField,
            sortDirection: sortDirection as SortDirection || 'asc',
            searchTerm,
            extensions
        };

        try {
            const authorization = req.headers.authorization;
            const result = await this.fileService.listFiles(options, authorization);
            
            // If the result is already in the correct format, return it directly
            if ('directories' in result) {
                return result;
            }
            
            // Otherwise, build the response in the correct format
            // This is for backward compatibility with implementations that don't return directories
            return {
            files: Array.isArray(result) ? result : (result.files || []),
            directories: result.directories || [],
            count: Array.isArray(result) ? result.length : (result.count || result.files?.length || 0),
            prefix: options.prefix,
            hasMore: Array.isArray(result) 
                ? result.length === options.limit 
                : (result.hasMore || (result.files?.length === options.limit)),
            nextMarker: result.nextMarker,
            totalSize: result.totalSize,
            parentDir: result.parentDir,
            breadcrumbs: result.breadcrumbs
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(`Failed to list files: ${error.message}`);
            }
            throw new BadRequestException('Failed to list files');
        }
    }
  
    @Delete(':key')
    @Authorize()
    @ApiOperation({ summary: 'Delete a file' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({
      status: 200,
      description: 'File deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' }
        }
      }
    })
    async deleteFile(@Param('key') key: string): Promise<{ success: boolean }> {
      const success = await this.fileService.deleteFile(key);
      return { success };
    }
  
    @Get('validate/:key')
    @Authorize()
    @ApiOperation({ summary: 'Check if a file exists' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({
      status: 200,
      description: 'File existence status',
      schema: {
        type: 'object',
        properties: {
          exists: { type: 'boolean' }
        }
      }
    })
    async fileExists(@Param('key') key: string): Promise<{ exists: boolean }> {
      const exists = await this.fileService.fileExists(key);
      return { exists };
    }

    @Post('directories')
    @Authorize()
    @ApiOperation({ summary: 'Create a new directory' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
            path: {
                type: 'string',
                description: 'Directory path to create'
            }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Directory created successfully',
        type: DirectoryMetadata
    })
    async createDirectory(
        @Body('path') dirPath: string,
        @CurrentUser('sub') userId?: string
    ): Promise<DirectoryMetadata> {
        if (!dirPath) {
            throw new BadRequestException('No directory path provided');
        }
        
        try {
            return await this.fileService.createDirectory(dirPath);
        } catch (error) {
            if (error instanceof Error) {
            throw new BadRequestException(`Directory creation failed: ${error.message}`);
            }
            throw new BadRequestException('Directory creation failed');
        }
    }

    @Delete('directories/:path(*)')
    @Authorize()
    @ApiOperation({ summary: 'Delete a directory' })
    @ApiParam({ name: 'path', description: 'Directory path to delete' })
    @ApiQuery({
        name: 'recursive',
        required: false,
        description: 'Whether to recursively delete non-empty directories'
    })
    @ApiResponse({
        status: 200,
        description: 'Directory deleted successfully',
        schema: {
            type: 'object',
            properties: {
            success: { type: 'boolean' }
            }
        }
    })
    async deleteDirectory(
        @Param('path') dirPath: string,
        @Query('recursive') recursive: boolean = false,
        @CurrentUser('sub') userId?: string
    ): Promise<{ success: boolean }> {
    try {
        const success = await this.fileService.deleteDirectory(dirPath, recursive);
        return { success };
    } catch (error) {
        if (error instanceof Error) {
            throw new BadRequestException(`Directory deletion failed: ${error.message}`);
        }
        throw new BadRequestException('Directory deletion failed');
    }
    }

    @Put('directories/:path(*)')
    @Authorize()
    @ApiOperation({ summary: 'Rename a directory' })
    @ApiParam({ name: 'path', description: 'Current directory path' })
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
        newPath: {
            type: 'string',
            description: 'New directory path'
        }
        }
    }
    })
    @ApiResponse({
        status: 200,
        description: 'Directory renamed successfully',
        type: DirectoryMetadata
    })
    async renameDirectory(
        @Param('path') dirPath: string,
        @Body('newPath') newPath: string,
        @CurrentUser('sub') userId?: string
    ): Promise<DirectoryMetadata> {
        if (!newPath) {
            throw new BadRequestException('No new path provided');
        }
        
        try {
            return await this.fileService.renameDirectory(dirPath, newPath);
        } catch (error) {
            if (error instanceof Error) {
            throw new BadRequestException(`Directory rename failed: ${error.message}`);
            }
            throw new BadRequestException('Directory rename failed');
        }
    }
}