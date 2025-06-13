import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiGenericResponses } from '@/common/decorators/generic-api-responses.decorator';
import { Action } from '@/common/enums/action.enum';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { ResourceScope } from '@/common/interceptors/scope.interceptor';
import { IJwtPayload } from '@/common/interfaces/jwt-payload.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
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
import path from 'path';
import { FILE_SERVICE } from './config/file-provider.config';
import { DirectoryMetadata } from './dtos/directory-metadata.dto';
import { FileListOptionsDto, FileSortField, SortDirection } from './dtos/file-list-options.dto';
import { FileListResponseDto } from './dtos/file-list-response.dto';
import { FileMetadata } from './dtos/file-meta-data.dto';
import { FileUploadOptions } from './dtos/file-upload-options.dto';
import { FileUploadDto } from './dtos/file-upload.dto';
import { IFileService } from './interfaces/file-service.interface';

  @ApiTags('Files')
  @Controller('files')
  export class FilesController {
    private readonly logger = new Logger(FilesController.name);
    private readonly GLOBAL_FILE_SIZE_LIMIT = 10000;
    private readonly ORGANIZATION_FILE_SIZE_LIMIT = 5000;
    private readonly BRANCH_FILE_SIZE_LIMIT = 2500;
    private readonly DEPARTMENT_FILE_SIZE_LIMIT = 1000;
    private readonly OWNED_FILE_SIZE_LIMIT = 500;
    private readonly MAX_FILE_SIZE = 100; // 100MB

    constructor(
        @Inject(FILE_SERVICE)
        private readonly fileService: IFileService
    ) {}

    private buildTenantFolder(organizationId?: string, branchId?: string, departmentId?: string, additionalPath?: string): string {
      const parts = [];
      
      if (organizationId) {
        parts.push('organizations', organizationId);
        
        if (branchId) {
          parts.push('branches', branchId);
          
          if (departmentId) {
            parts.push('departments', departmentId);
          }
        }
      }
      
      if (additionalPath) {
        parts.push(additionalPath);
      }
      
      return parts.join('/');
    }

    private getEffectiveTenantContext(
      resourceScope: ResourceScope,
      requestedOrgId?: string,
      requestedBranchId?: string,
      requestedDeptId?: string,
      requestedUserId?: string
    ): { organizationId?: string; branchId?: string; departmentId?: string; userId?: string } {
      switch (resourceScope.type) {
        case RoleScopeType.GLOBAL:
          return {
            organizationId: requestedOrgId,
            branchId: requestedBranchId,
            departmentId: requestedDeptId
          };
          
        case RoleScopeType.ORGANIZATION:
          return {
            organizationId: requestedOrgId || resourceScope.organizations?.[0],
            branchId: requestedBranchId,
            departmentId: requestedDeptId
          };
          
        case RoleScopeType.BRANCH:
          return {
            organizationId: requestedOrgId || resourceScope.organizations?.[0],
            branchId: requestedBranchId || resourceScope.branches?.[0],
            departmentId: requestedDeptId
          };
          
        case RoleScopeType.DEPARTMENT:
          return {
            organizationId: requestedOrgId || resourceScope.organizations?.[0],
            branchId: requestedBranchId || resourceScope.branches?.[0],
            departmentId: requestedDeptId || resourceScope.departments?.[0]
          };
          
        case RoleScopeType.OWNED:
          return {
            organizationId: requestedOrgId,
            branchId: requestedBranchId,
            departmentId: requestedDeptId
          };
          
        default:
          return {};
      }
    }
  
    @Post('upload')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
      summary: 'Upload a Single File with Multi-tenant Security',
      description: 'Uploads a file to the tenant-specific directory with access control based on user scope.'
    })
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
    @ApiQuery({
      name: 'organizationId',
      type: String,
      required: false,
      description: 'Organization ID for organization/branch/department scoped uploads'
    })
    @ApiQuery({
      name: 'branchId',
      required: false,
      type: String,
      description: 'Branch ID for branch/department scoped uploads'
    })
    @ApiQuery({
      name: 'departmentId',
      type: String,
      required: false,
      description: 'Department ID for department scoped uploads'
    })
    @ApiQuery({
      name: 'folder',
      required: false,
      type: String,
      description: 'Folder path relative to tenant root directory'
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description: 'User ID for user-specific uploads (admin only or owned resources)'
    })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'File uploaded successfully',
      type: FileMetadata
    })
    @ApiGenericResponses()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Req() req: any,
      @Query() query: FileUploadDto,
      @CurrentUser() user?: IJwtPayload,
    ): Promise<FileMetadata> {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const resourceScope = req.resourceScope;

      try {
        // Extract tenant context from query
        const tenantContext = {
          organizationId: query.organizationId,
          branchId: query.branchId,
          departmentId: query.departmentId,
          userId: query.userId
        };

        // Validate tenant access and get the base tenant directory
        const tenantDirectory = UtilityHelper.validateAndGetTenantDirectory(
          resourceScope,
          tenantContext
        );

        // Build the full upload path
        let uploadPath = tenantDirectory;
        if (query.folder) {
          // Sanitize the folder path to prevent directory traversal
          const sanitizedFolder = query.folder
            .replace(/\.\./g, '') // Remove ..
            .replace(/^\/+/, '') // Remove leading slashes
            .replace(/\/+/g, '/'); // Normalize multiple slashes
          
          if (sanitizedFolder) {
            uploadPath = path.join(tenantDirectory, sanitizedFolder);
          }
        }

        // log upload path
        this.logger.log(`Uploading file to path: ${uploadPath}`);

        // Validate the final path is within the allowed tenant directory
        if (!UtilityHelper.validateFilePath(uploadPath, tenantDirectory)) {
          throw new ForbiddenException('Invalid file path: outside allowed directory');
        }

        // Additional file validation based on scope
        this.validateFileUpload(file, resourceScope, uploadPath);

        // Create upload options with tenant metadata
        const uploadOptions: FileUploadOptions = {
          folder: uploadPath,
          token: req.headers.authorization,
          organizationId: tenantContext.organizationId,
          branchId: tenantContext.branchId,
          departmentId: tenantContext.departmentId,
          userId: user?.sub,
          scope: resourceScope.type,
          maxSizeBytes: this.MAX_FILE_SIZE * 1024 * 1024, // 100MB
          metadata: {
            uploadedBy: user?.sub || 'anonymous',
            uploadedAt: new Date().toISOString(),
            tenantDirectory: tenantDirectory,
            originalPath: uploadPath
          }
        };

        // Upload the file
        return await this.fileService.uploadFile(file, uploadOptions);

      } catch (error) {
        this.logger.error(
          `File upload failed for user ${user?.sub}: ${error instanceof Error ? error.message : String(error)}`
        );
        
        if (error instanceof ForbiddenException || error instanceof BadRequestException) {
          throw error;
        }
        
        throw new BadRequestException(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    /**
     * Validates file upload based on scope and path restrictions
     */
    private validateFileUpload(
      file: Express.Multer.File,
      resourceScope: any,
      uploadPath: string
    ): void {
      // File size limits based on scope
      const maxSizeByScope: any = {
        [RoleScopeType.GLOBAL]: this.GLOBAL_FILE_SIZE_LIMIT * 1024 * 1024, // 100MB
        [RoleScopeType.ORGANIZATION]: this.ORGANIZATION_FILE_SIZE_LIMIT * 1024 * 1024, // 50MB
        [RoleScopeType.BRANCH]: this.BRANCH_FILE_SIZE_LIMIT * 1024 * 1024, // 25MB
        [RoleScopeType.DEPARTMENT]: this.DEPARTMENT_FILE_SIZE_LIMIT * 1024 * 1024, // 10MB
        [RoleScopeType.OWNED]: this.OWNED_FILE_SIZE_LIMIT * 1024 * 1024, // 5MB
      };

      const maxSize = maxSizeByScope[resourceScope.type] || maxSizeByScope[RoleScopeType.OWNED];
      
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${resourceScope.type} scope`
        );
      }

      // Restricted file types for certain scopes
      const restrictedTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program'
      ];

      if (resourceScope.type !== RoleScopeType.GLOBAL && restrictedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed for ${resourceScope.type} scope`
        );
      }

      // Path depth restrictions
      // const pathDepth = uploadPath.split('/').length;
      // const maxDepthByScope: any = {
      //   [RoleScopeType.GLOBAL]: 10,
      //   [RoleScopeType.ORGANIZATION]: 8,
      //   [RoleScopeType.BRANCH]: 6,
      //   [RoleScopeType.DEPARTMENT]: 5,
      //   [RoleScopeType.OWNED]: 4,
      // };

      // const maxDepth = maxDepthByScope[resourceScope.type] || maxDepthByScope[RoleScopeType.OWNED];
      
      // if (pathDepth > maxDepth) {
      //   throw new BadRequestException(
      //     `Upload path depth ${pathDepth} exceeds maximum allowed depth of ${maxDepth} for ${resourceScope.type} scope`
      //   );
      // }
    }
  
    // @Post('upload-multiple')
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
  
    @Get('metadata/:key(*)')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Get file metadata with multi-tenant security' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiQuery({
      name: 'organizationId',
      type: String,
      required: false,
      description: 'Organization ID for scoped access'
    })
    @ApiQuery({
      name: 'branchId',
      required: false,
      type: String,
      description: 'Branch ID for scoped access'
    })
    @ApiQuery({
      name: 'departmentId',
      type: String,
      required: false,
      description: 'Department ID for scoped access'
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description: 'User ID for user-specific access'
    })
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

    private async validateFileAccess(
    fileKey: string,
    resourceScope: ResourceScope,
    userId?: string,
    action: 'read' | 'delete' = 'read'
  ): Promise<void> {
    // Extract tenant information from file path
    const pathParts = fileKey.split('/');
    
    if (pathParts.length < 2) {
      // If it's not in a tenant-specific path, only allow if it's owned scope and matches user
      if (resourceScope.type === RoleScopeType.OWNED) {
        // For owned scope, we'd need to check file metadata to see if user owns it
        // This would require extending the file service to include ownership info
        return;
      } else if (resourceScope.type === RoleScopeType.GLOBAL) {
        return; // Global scope can access any file
      }
      throw new ForbiddenException('Access denied to this file');
    }

    // Parse tenant path structure: organizations/orgId/branches/branchId/departments/deptId/...
    const tenantInfo = this.parseTenantPath(fileKey);
    
    // Validate access based on scope
    switch (resourceScope.type) {
      case RoleScopeType.GLOBAL:
        return; // Global scope can access any file
        
      case RoleScopeType.ORGANIZATION:
        if (tenantInfo.organizationId && !resourceScope.organizations?.includes(tenantInfo.organizationId)) {
          throw new ForbiddenException('Access denied to this organization\'s files');
        }
        break;
        
      case RoleScopeType.BRANCH:
        if (tenantInfo.branchId && !resourceScope.branches?.includes(tenantInfo.branchId)) {
          throw new ForbiddenException('Access denied to this branch\'s files');
        }
        break;
        
      case RoleScopeType.DEPARTMENT:
        if (tenantInfo.departmentId && !resourceScope.departments?.includes(tenantInfo.departmentId)) {
          throw new ForbiddenException('Access denied to this department\'s files');
        }
        break;
        
      case RoleScopeType.OWNED:
        // For owned scope, would need to check file metadata for actual ownership
        // This is a simplified check based on path structure
        break;
    }
  }

  private parseTenantPath(filePath: string): {
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
  } {
    const parts = filePath.split('/');
    const result: { organizationId?: string; branchId?: string; departmentId?: string } = {};
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === 'organizations' && parts[i + 1]) {
        result.organizationId = parts[i + 1];
      } else if (parts[i] === 'branches' && parts[i + 1]) {
        result.branchId = parts[i + 1];
      } else if (parts[i] === 'departments' && parts[i + 1]) {
        result.departmentId = parts[i + 1];
      }
    }
    
    return result;
  }
  
    @Get('download/:key(*)')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Download a file with access control' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiResponse({ status: 200, description: 'File download' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async downloadFile(
      @Param('key') key: string,
      @Req() req: any,
      @Res() res: Response,
      @CurrentUser() user?: IJwtPayload,
    ): Promise<void> {
      const resourceScope = req.resourceScope as ResourceScope;
      
      // Check if user has access to this file based on the file path and their scope
      await this.validateFileAccess(key, resourceScope, user?.sub);
      
      try {
        await this.fileService.downloadFile(key, res);
      } catch (error) {
        throw new NotFoundException(`File not found: ${key}`);
      }
    }
  
    @Get('stream/:key(*)')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Stream a file (for browser viewing) with tenant security' })
    @ApiParam({ name: 'key', description: 'File key' })
    @ApiQuery({
      name: 'organizationId',
      type: String,
      required: false,
      description: 'Organization ID for scoped access'
    })
    @ApiQuery({
      name: 'branchId',
      required: false,
      type: String,
      description: 'Branch ID for scoped access'
    })
    @ApiQuery({
      name: 'departmentId',
      type: String,
      required: false,
      description: 'Department ID for scoped access'
    })
    @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description: 'User ID for user-specific access'
    })
    @ApiResponse({ status: 200, description: 'File stream' })
    @ApiGenericResponses()
    @UseInterceptors()
    @Version(VERSION_NEUTRAL)
    async streamFile(
      @Param('key') fileKey: string,
      @Query() query: {
        organizationId?: string;
        branchId?: string;
        departmentId?: string;
        userId?: string;
      },
      @Req() req: any,
      @Res() res: any,
      @CurrentUser() user?: IJwtPayload,
    ): Promise<void> {
        const resourceScope = req.resourceScope;

        // Extract tenant context from query
        const tenantContext = {
          organizationId: query.organizationId,
          branchId: query.branchId,
          departmentId: query.departmentId,
          userId: query.userId
        };

        // Get file metadata first to validate access
        const metadata = await this.fileService.getFileMetadata(fileKey, req.headers.authorization);
        
        // Get file stream with tenant validation
        const stream = await this.fileService.getFileStream(fileKey, {
          scope: resourceScope,
          tenantContext,
          authorization: req.headers.authorization
        });

        // Set appropriate headers for streaming
        res.set({
          'Content-Type': metadata.mimeType,
          'Content-Length': metadata.size.toString(),
          'Content-Disposition': `inline; filename="${encodeURIComponent(metadata.originalName)}"`,
          'Cache-Control': 'public, max-age=31536000', // 1 year cache
          'Last-Modified': metadata.lastModified?.toUTCString(),
          'ETag': `"${metadata.size}-${metadata.lastModified?.getTime()}"`,
        });

        // Handle range requests for video/audio streaming
        const range = req.headers.range;
        if (range && (metadata.mimeType.startsWith('video/') || metadata.mimeType.startsWith('audio/'))) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : metadata.size - 1;
          const chunksize = (end - start) + 1;

          res.status(206);
          res.set({
            'Content-Range': `bytes ${start}-${end}/${metadata.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize.toString(),
          });

          // Get range stream from file service
          const rangeStream = await this.fileService.getFileStream(fileKey, {
            scope: resourceScope,
            tenantContext,
            authorization: req.headers.authorization
          });
          rangeStream.pipe(res);
        } else {
          // Stream the entire file
          stream.pipe(res);
        }

        this.logger.log(
          `File streamed: ${fileKey} by user ${user?.sub} from tenant context: ${JSON.stringify(tenantContext)}`
        );
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
  
   @Delete(':key(*)')
  @Authorize({ endpointType: Action.DELETE })
  @ApiOperation({ summary: 'Delete a file with access control' })
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
  async deleteFile(
    @Param('key') key: string,
    @Req() req: any,
    @CurrentUser() user?: IJwtPayload,
  ): Promise<{ success: boolean }> {
    const resourceScope = req.resourceScope as ResourceScope;
    
    // Check if user has delete access to this file
    await this.validateFileAccess(key, resourceScope, user?.sub, 'delete');
    
    const success = await this.fileService.deleteFile(key);
    return { success };
  }

  @Get('list')
@Authorize({ endpointType: Action.READ })
@ApiOperation({ summary: 'List files with scope-based access control' })
@ApiQuery({
  name: 'page',
  required: false,
  type: Number,
  description: 'Page number for pagination'
})
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Number of items per page (max 1000)'
})
@ApiQuery({
  name: 'folder',
  required: false,
  type: String,
  description: 'Folder path to list files from'
})
@ApiQuery({
  name: 'includeUrls',
  required: false,
  type: Boolean,
  description: 'Include downloadable URLs in response'
})
@ApiQuery({
  name: 'includeDirs',
  required: false,
  type: Boolean,
  description: 'Include directories in results'
})
@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: FileSortField,
  description: 'Field to sort by (name, size, createdAt, lastModified, mimeType)'
})
@ApiQuery({
  name: 'sortDirection',
  required: false,
  enum: SortDirection,
  description: 'Sort direction (asc, desc)'
})
@ApiQuery({
  name: 'searchTerm',
  required: false,
  type: String,
  description: 'Search term for filtering files by name'
})
@ApiQuery({
  name: 'showHidden',
  required: false,
  type: Boolean,
  description: 'Include hidden files (starting with .)'
})
@ApiResponse({
  status: 200,
  description: 'Files listed successfully',
  type: FileListResponseDto
})
@ApiResponse({ status: 403, description: 'Access denied' })
  async listFiles(
  @Query() queryDto: FileListOptionsDto,
  @Req() req: any,
  @CurrentUser() user?: IJwtPayload,
): Promise<FileListResponseDto> {
  const resourceScope = req.resourceScope as ResourceScope;
  if (!resourceScope) {
    throw new ForbiddenException('Access scope not determined');
  }

  try {

    // Get effective tenant context based on user's scope and request
    const effectiveContext = this.getEffectiveTenantContext(
      resourceScope,
      queryDto.scope?.organizationId,
      queryDto.scope?.branchId,
      queryDto.scope?.departmentId
    );

    // Build the folder path for file listing
    const folderPath = this.buildTenantFolder(
      effectiveContext.organizationId,
      effectiveContext.branchId,
      effectiveContext.departmentId,
      queryDto.folder
    );

    const authorization = req.headers.authorization;
    
    // Convert DTO to service options format with proper folder path
    const listOptions = this.convertToServiceOptions(queryDto, folderPath);
    
    // Get files and directories from the file service
    const serviceResult = await this.fileService.listFiles(listOptions, authorization);

    // Filter files based on user's actual permissions
    const filteredFiles = await this.filterFilesByUserScope(
      serviceResult.files || [],
      resourceScope,
      user?.sub
    );

    // The service now returns the proper pagination format, so we use it directly
    const response: FileListResponseDto = {
      files: filteredFiles,
      directories: serviceResult.directories,
      pagination: serviceResult.pagination!,
      parentDir: serviceResult.parentDir,
      breadcrumbs: serviceResult.breadcrumbs,
      scope: {
        organizationId: effectiveContext.organizationId,
        branchId: effectiveContext.branchId,
        departmentId: effectiveContext.departmentId,
        userId: resourceScope.type === RoleScopeType.OWNED ? user?.sub : undefined
      }
    };

    return response;
  } catch (error) {
    this.logger.error(`Error listing files for user ${user?.sub}:`, error);
    
    // More specific error handling
    if (error instanceof ForbiddenException) {
      throw error;
    } else if (error instanceof Error) {
      throw new BadRequestException(`Failed to list files: ${error.message}`);
    }
    
    throw new BadRequestException('Failed to list files: Unknown error');
  }
}

  /**
   * Converts DTO options to service-compatible options
   */
  private convertToServiceOptions(queryDto: FileListOptionsDto, folderPath?: string): FileListOptionsDto {
    return {
      folder: folderPath || queryDto.folder,
      page: queryDto.page || 1,
      limit: queryDto.limit || 50,
      includeDirs: queryDto.includeDirs ?? true,
      includeUrls: queryDto.includeUrls ?? true,
      sortBy: queryDto.sortBy || FileSortField.NAME,
      sortDirection: queryDto.sortDirection || SortDirection.ASC,
      searchTerm: queryDto.searchTerm,
      showHidden: queryDto.showHidden ?? false,
      scope: queryDto.scope
    };
  }

  /**
   * Filters files based on user's scope and permissions
   */
  private async filterFilesByUserScope(
    files: FileMetadata[],
    resourceScope: ResourceScope,
    userId?: string
  ): Promise<FileMetadata[]> {
    if (resourceScope.type === RoleScopeType.GLOBAL) {
      return files; // Global scope can see all files
    }

    return files.filter(file => {
      try {
        // For owned scope, filter files by user ownership
        if (resourceScope.type === RoleScopeType.OWNED) {
          return file.metadata?.uploadedBy === userId || 
                 file.metadata?.userId === userId;
        }

        // For other scopes, validate based on file metadata and path
        const tenantInfo = this.parseTenantPath(file.key);
        
        // Check organization access
        if (resourceScope.type === RoleScopeType.ORGANIZATION ||
            resourceScope.type === RoleScopeType.BRANCH ||
            resourceScope.type === RoleScopeType.DEPARTMENT) {
          
          const fileOrgId = file.metadata?.organizationId || tenantInfo.organizationId;
          if (fileOrgId && resourceScope.organizations && 
              !resourceScope.organizations.includes(fileOrgId)) {
            return false;
          }
        }

        // Check branch access
        if (resourceScope.type === RoleScopeType.BRANCH ||
            resourceScope.type === RoleScopeType.DEPARTMENT) {
          
          const fileBranchId = file.metadata?.branchId || tenantInfo.branchId;
          if (fileBranchId && resourceScope.branches && 
              !resourceScope.branches.includes(fileBranchId)) {
            return false;
          }
        }

        // Check department access
        if (resourceScope.type === RoleScopeType.DEPARTMENT) {
          const fileDeptId = file.metadata?.departmentId || tenantInfo.departmentId;
          if (fileDeptId && resourceScope.departments && 
              !resourceScope.departments.includes(fileDeptId)) {
            return false;
          }
        }

        return true;
      } catch (error) {
        this.logger.warn(`Error filtering file ${file.key}:`, error);
        return false; // When in doubt, filter out
      }
    });
  }

  /**
   * Builds breadcrumb navigation for the current path
   */
  private buildBreadcrumbs(
    organizationId?: string,
    branchId?: string,
    departmentId?: string,
    additionalFolder?: string
  ): Array<{ name: string; path: string }> {
    const breadcrumbs: Array<{ name: string; path: string }> = [
      { name: 'Home', path: '/' }
    ];

    if (organizationId) {
      breadcrumbs.push({
        name: `Org: ${organizationId}`,
        path: `/organizations/${organizationId}`
      });

      if (branchId) {
        breadcrumbs.push({
          name: `Branch: ${branchId}`,
          path: `/organizations/${organizationId}/branches/${branchId}`
        });

        if (departmentId) {
          breadcrumbs.push({
            name: `Dept: ${departmentId}`,
            path: `/organizations/${organizationId}/branches/${branchId}/departments/${departmentId}`
          });
        }
      }
    }

    if (additionalFolder) {
      const folderParts = additionalFolder.split('/');
      let currentPath = breadcrumbs[breadcrumbs.length - 1].path;
      
      folderParts.forEach(part => {
        currentPath += `/${part}`;
        breadcrumbs.push({
          name: part,
          path: currentPath
        });
      });
    }

    return breadcrumbs;
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