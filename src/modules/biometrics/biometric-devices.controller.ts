import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { Body, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
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

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }

    @ApiOperation({ summary: 'Connect to a biometric device' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Device connected successfully',
        type: GetBiometricDeviceDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
        type: GeneralResponseDto
    })
    @ApiBody({
        description: 'Device connection parameters',
        type: ConnectDeviceDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Connection error',
        type: GeneralResponseDto
    })
    @Post('devices/connect')
    async connectDevice(
        @Body() connectDeviceDto: ConnectDeviceDto,
    ): Promise<GetBiometricDeviceDto> {
        const service = this.biometricsFactory.getService(connectDeviceDto.deviceType);
        
        return await service.connect(
            connectDeviceDto
        );
    }

    @ApiOperation({ summary: 'Disconnect from a biometric device' })
    @ApiResponse({ 
        status: HttpStatus.OK,
        description: 'Device disconnected successfully',
        type: GetBiometricDeviceDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error disconnecting device',
        type: GeneralResponseDto
    })
    @ApiParam({
        name: 'deviceId', description:
        'Device ID to disconnect from',
        type: UUID
    })
    @Post('devices/:deviceId/disconnect')
    async disconnectDevice(@Param('deviceId') deviceId: string): Promise<GetBiometricDeviceDto> {
        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        
        return await service.disconnect(deviceId);
    }
}