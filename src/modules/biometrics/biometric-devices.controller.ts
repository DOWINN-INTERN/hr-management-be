import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ApiCreateResponses, ApiGenericResponses, ApiUpdateResponses } from "@/common/decorators/generic-api-responses.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { UtilityHelper } from "@/common/helpers/utility.helper";
import { Body, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Req } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { GetBiometricDeviceDto, UpdateBiometricDeviceDto } from "./dtos/biometric-device.dto";
import { ConnectDeviceDto } from "./dtos/connect-device.dto";
import { BiometricDevice } from "./entities/biometric-device.entity";
import { BiometricDevicesService } from "./services/biometric-devices.service";
import { BiometricsFactoryService } from "./services/biometrics-factory.service";

export class BiometricDevicesController extends createController(BiometricDevice, BiometricDevicesService, GetBiometricDeviceDto, undefined, UpdateBiometricDeviceDto)
{
    constructor(
        @Inject(BiometricsFactoryService)
        private readonly biometricsFactory: BiometricsFactoryService,
        private readonly biometricDevicesService: BiometricDevicesService
    ) {
        super(biometricDevicesService);
    }

    override async create(entityDto: null, createdById: string): Promise<GetBiometricDeviceDto> {
        return await super.create(entityDto, createdById);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }
    
    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetBiometricDeviceDto> {
        return await super.findOne(fieldsString, relations, select);
    }
    
    @Post('devices/connect')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({ summary: 'Connect to a biometric device' })
    @ApiBody({
        description: 'Device connection parameters',
        type: ConnectDeviceDto
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Device already connected',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Device connected successfully',
        type: GetBiometricDeviceDto
    })
    @ApiCreateResponses('Biometric Device', GetBiometricDeviceDto)
    @ApiGenericResponses()
    async connectDevice(
        @Req() req: any,
        @Body() connectDeviceDto: ConnectDeviceDto,
        @CurrentUser('sub') createdBy: string
    ): Promise<GetBiometricDeviceDto> {
        // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneBy({ deviceId: connectDeviceDto.ipAddress + ":" + connectDeviceDto.port });
        if (device) {
            UtilityHelper.checkScopeAccess(device, req.resourceScope);
        }

        const service = this.biometricsFactory.getService(connectDeviceDto.deviceType);
        
        return await service.connect(
            connectDeviceDto,
            createdBy
        );
    }

    @Put('devices/:deviceId/disconnect')
    @ApiOperation({ summary: 'Disconnect from a biometric device' })
    @Authorize({ endpointType: Action.UPDATE })
    @ApiParam({
        name: 'deviceId', description:
        'Device ID to disconnect from',
        type: String
    })
    @ApiResponse({ 
        status: HttpStatus.OK,
        description: 'Biometric Device disconnected successfully',
        type: GetBiometricDeviceDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Biometric Device not found',
        type: GeneralResponseDto
    })
    @ApiUpdateResponses('Biometric Device', GetBiometricDeviceDto)
    @ApiGenericResponses()
    async disconnectDevice(@Req() req: any, @Param('deviceId') deviceId: string): Promise<GetBiometricDeviceDto> {
        // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneByOrFail({ deviceId });
        UtilityHelper.checkScopeAccess(device, req.resourceScope);

        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        
        return await service.disconnect(deviceId, true);
    }

    @Get('devices/:deviceId/time')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Get device time' })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Biometric Device time retrieved successfully',
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async getTime(@Req() req: any, @Param('deviceId') deviceId: string): Promise<{ deviceId: string; time: Date }> {
        // Check if user has access to this device based on scope
        UtilityHelper.checkScopeAccess(await this.biometricDevicesService.findOneByOrFail({ deviceId }), req.resourceScope);

        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        
        const time = await service.getTime(deviceId);
        
        return { deviceId, time };
    }

    @Put('devices/:deviceId/time')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({ 
        summary: 'Set device time', 
        description: 'Sets the time on the biometric device. If no time is provided, it uses the current server time.' 
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @ApiBody({
        description: 'Time to set on the device (optional)',
        type: Object,
        schema: {
            properties: {
                time: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' }
            },
            required: []
        }
    })
    @ApiResponse({ 
        status: HttpStatus.OK, description:
        'Biometric Device time set successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Biometric device not found',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async setTime(
        @Req() req: any,
        @Param('deviceId') deviceId: string,
        @Body() body: { time?: string }
    ): Promise<Partial<GeneralResponseDto>> {
        UtilityHelper.checkScopeAccess(await this.biometricDevicesService.findOneByOrFail({ deviceId }), req.resourceScope);

        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        
        // Parse the time or use current time
        const time = body.time ? new Date(body.time) : new Date();
        
        // Validate time format
        if (isNaN(time.getTime())) {
            throw new HttpException(
                'Invalid time format',
                HttpStatus.BAD_REQUEST
            );
        }
        
        const result = await service.setTime(deviceId, time);
        
        return { message: "Biometric Device time set successfully" };
    }
    
}