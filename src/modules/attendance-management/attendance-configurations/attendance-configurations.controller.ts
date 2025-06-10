import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { Organization } from "@/modules/organization-management/entities/organization.entity";
import { Body, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { AttendanceConfigurationsService } from "./attendance-configurations.service";
import { AttendanceConfigurationDto, GetAttendanceConfigurationDto, UpdateAttendanceConfigurationDto } from "./dtos/attendance-configuration.dto";
import { AttendanceConfiguration } from "./entities/attendance-configuration.entity";

export class AttendanceConfigurationsController extends createController(
    AttendanceConfiguration,       // Entity name for Swagger documentation
    AttendanceConfigurationsService, // The service handling AttendanceConfiguration-related operations
    GetAttendanceConfigurationDto,  // DTO for retrieving AttendanceConfigurations
    AttendanceConfigurationDto,     // DTO for creating AttendanceConfigurations
    UpdateAttendanceConfigurationDto, // DTO for updating AttendanceConfigurations
) {
    override async create(entityDto: AttendanceConfigurationDto, createdById: string): Promise<GetAttendanceConfigurationDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: UpdateAttendanceConfigurationDto, updatedById: string): Promise<GetAttendanceConfigurationDto> {
        return await super.update(id, entityDto, updatedById);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetAttendanceConfigurationDto> {
        return await super.findOne(fieldsString, relations, select);
    }

    override async findById(id: string, relations?: string, select?: string): Promise<GetAttendanceConfigurationDto> {
        return await super.findById(id, relations, select);
    }

    @Get('organization/:organizationId')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ 
        summary: 'Get attendance configuration for organization',
        description: 'Returns organization-specific configuration or global default if none exists'
    })
    @ApiParam({ name: 'organizationId', description: 'Organization ID' })
    @ApiResponse({ 
        status: HttpStatus.OK,
        description: 'Attendance configuration retrieved successfully',
        type: GetAttendanceConfigurationDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error retrieving attendance configuration',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access to this resource',
    })
    async getOrganizationConfiguration(
        @Param('organizationId', ParseUUIDPipe) organizationId: string
    ): Promise<GetAttendanceConfigurationDto> {
        const config = await this.baseService.getOrganizationAttendanceConfiguration(organizationId);
        return plainToInstance(this.getDtoClass, config);
    }

    @Get('global')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ 
        summary: 'Get global attendance configuration',
        description: 'Returns the global default attendance configuration'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Global attendance configuration retrieved successfully',
        type: GetAttendanceConfigurationDto
    })
    async getGlobalConfiguration(): Promise<GetAttendanceConfigurationDto> {
        const config = await this.baseService.getGlobalAttendanceConfiguration();
        return plainToInstance(this.getDtoClass, config);
    }

    @Post('organization/:organizationId')
    @Put('organization/:organizationId')
    @Authorize({ endpointType: Action.MANAGE })
    @ApiOperation({ 
        summary: 'Create or update organization attendance configuration',
        description: 'Creates new configuration or updates existing one for the organization'
    })
    @ApiParam({ name: 'organizationId', description: 'Organization ID' })
    @ApiBody({
        type: AttendanceConfigurationDto,
        description: 'Attendance configuration data for the organization'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Organization attendance configuration saved successfully',
        type: GetAttendanceConfigurationDto
    })
    async createOrUpdateOrganizationConfiguration(
        @Param('organizationId', ParseUUIDPipe) organizationId: string,
        @Body() configDto: AttendanceConfigurationDto,
        @CurrentUser('sub') userId: string
    ): Promise<GetAttendanceConfigurationDto> {
        // Check if organization already has a configuration
        const existingConfig = await this.baseService.findOneBy(
            { organization: new Organization({ id: organizationId }) },
            { relations: { organization: true } }
        );

        let savedConfig: AttendanceConfiguration;

        if (existingConfig) {
            // Update existing configuration
            savedConfig = await this.baseService.update(existingConfig.id, {
                ...configDto,
                organization: new Organization({ id: organizationId })
            }, userId);
        } else {
            // Create new configuration for organization
            savedConfig = await this.baseService.create({
                ...configDto,
                organization: new Organization({ id: organizationId })
            }, userId);
        }

        return plainToInstance(this.getDtoClass, savedConfig);
    }

    @Put('global')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({ 
        summary: 'Update global attendance configuration',
        description: 'Updates the global default attendance configuration'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Global attendance configuration updated successfully',
        type: GetAttendanceConfigurationDto
    })
    async updateGlobalConfiguration(
        @Body() configDto: UpdateAttendanceConfigurationDto,
        @CurrentUser('sub') userId: string
    ): Promise<GetAttendanceConfigurationDto> {
        const updatedConfig = await this.baseService.updateGlobalAttendanceConfiguration(configDto);
        return plainToInstance(this.getDtoClass, updatedConfig);
    }
}