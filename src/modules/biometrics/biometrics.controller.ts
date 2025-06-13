import { Authorize } from '@/common/decorators/authorize.decorator';
import { ApiGenericResponses } from '@/common/decorators/generic-api-responses.decorator';
import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { Action } from '@/common/enums/action.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BiometricUserDto, GetBiometricUserDto } from './dtos/biometric-user.dto';
import { ErrorResponseDto } from './dtos/error-response.dto';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AttendanceRecord, IBiometricTemplate, IBiometricUser } from './interfaces/biometric.interface';
import { BiometricDevicesService } from './services/biometric-devices.service';
import { BiometricsFactoryService } from './services/biometrics-factory.service';

class GetFingerprintDto {
    @ApiProperty({
        description: 'Device ID to get fingerprint from',
        example: '192.168.1.100:4370'
    })
    deviceId!: string;

    @ApiProperty({
        description: 'User ID',
        example: '1001'
    })
    userId!: string;

    @ApiProperty({
        description: 'Finger ID (0-9)',
        example: 0,
        required: false
    })
    @IsOptional()
    fingerId?: number = 0;
}

// New DTOs for additional endpoints

class SetDeviceTimeDto {
    @ApiProperty({
        description: 'Time to set on the device (ISO format)',
        example: '2025-05-06T12:00:00.000Z',
        required: false
    })
    @IsOptional()
    @IsString()
    time?: string;
}

class UnlockDoorDto {
    @ApiProperty({
        description: 'Delay in seconds to keep the door unlocked',
        example: 3,
        required: false
    })
    @IsOptional()
    @IsNumber()
    delay?: number;
}

class SyncUsersDto {
    @ApiProperty({
        description: 'Source device ID to copy users from',
        example: '192.168.1.100:4370'
    })
    @IsString()
    sourceDeviceId!: string;

    @ApiProperty({
        description: 'Target device ID to copy users to',
        example: '192.168.1.101:4370'
    })
    @IsString()
    targetDeviceId!: string;
}

class ExecuteCommandDto {
    @ApiProperty({
        description: 'Command to execute on device',
        example: 'get_device_info1'
    })
    @IsString()
    command!: string;

    @ApiProperty({
        description: 'Data for the command (optional)',
        example: '{"value": 1}',
        required: false
    })
    @IsOptional()
    @IsString()
    data?: string;
}

@ApiTags('Biometrics')
@Controller()
@UseInterceptors(new TimeoutInterceptor(30))
export class BiometricsController {
    constructor(
        private readonly biometricsFactory: BiometricsFactoryService,
        private readonly biometricDevicesService: BiometricDevicesService
    ) {}

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'An unknown error occurred';
    }

    private handleError(
        error: unknown,
        defaultMessage: string,
        notImplementedMessage: string
    ): never {
        if (error instanceof HttpException) {
            throw error;
        }

        const errorMessage = this.getErrorMessage(error);
        
        // Check if this is a "not implemented" error
        if (errorMessage.includes('not implemented') || errorMessage.includes('NOT_IMPLEMENTED')) {
            throw new HttpException(
                notImplementedMessage,
                HttpStatus.NOT_IMPLEMENTED
            );
        }
        
        // Check if this is a "not found" error
        if (errorMessage.includes('not found') || errorMessage.includes('not connected')) {
            throw new HttpException(
                `Device not found or not connected: ${errorMessage}`,
                HttpStatus.NOT_FOUND
            );
        }

        // Generic error response
        throw new HttpException(
            `${defaultMessage}: ${errorMessage}`,
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ApiOperation({ summary: 'Get fingerprint template for a user' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Fingerprint template retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '1001-0' },
                userId: { type: 'string', example: '1001' },
                fingerId: { type: 'number', example: 0 },
                template: { type: 'string', format: 'binary', description: 'Binary template data' },
                provider: { type: 'string', example: 'zkteco' }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Template or device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid request',
        type: ErrorResponseDto
    })
    @Get('users/fingerprint')
    async getUserFingerprint(
        @Query(new ValidationPipe({ transform: true })) getFingerprintDto: GetFingerprintDto
    ): Promise<IBiometricTemplate | null> {
        try {
            const { deviceId, userId, fingerId = 0 } = getFingerprintDto;
            
            // Get the appropriate service based on device type
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const template = await service.getUserFingerprint(
                deviceId,
                userId,
                fingerId
            );
            
            if (!template) {
                throw new HttpException(
                    `No fingerprint template found for user ${userId} (finger ${fingerId})`,
                    HttpStatus.NOT_FOUND
                );
            }
            
            return template;
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to retrieve fingerprint template',
                'Fingerprint template retrieval not supported by this device type'
            );
        }
    }

    @Post('users/register')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({ summary: 'Register a new user on a biometric device' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'User registered successfully',
        type: BiometricUserDto
    })
    @ApiGenericResponses()
    async registerUser(
        @Req() req: any,
        @Body() setUserDto: BiometricUserDto,
    ): Promise<BiometricUserDto> {
         // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneBy({ deviceId: setUserDto.deviceId });
        if (!device) {
            throw new HttpException(
                `Biometric Device ${setUserDto.deviceId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        // Get resource scope from request
        const resourceScope = req.resourceScope;

        // Check if user has access to this device based on scope
        const hasAccess = UtilityHelper.checkScopeAccess(device, resourceScope);
        if (!hasAccess) {
            throw new HttpException(
                `You don't have permission to register users on Biometric Device ${setUserDto.deviceId}`,
                HttpStatus.FORBIDDEN
            );
        }

        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(setUserDto.deviceId);

        return await service.registerUser(
            setUserDto.deviceId,
            setUserDto
        );
    }

    @Put('users/update')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({ summary: 'Update an existing user on a biometric device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User updated successfully',
        type: BiometricUserDto
    })
    @ApiGenericResponses()
    async updateUser(
        @Req() req: any,
        @Body() setUserDto: BiometricUserDto,
    ): Promise<BiometricUserDto> {
        // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneBy({ deviceId: setUserDto.deviceId });
        if (!device) {
            throw new HttpException(
                `Biometric Device ${setUserDto.deviceId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        // Get resource scope from request
        const resourceScope = req.resourceScope;

        // Check if user has access to this device based on scope
        const hasAccess = UtilityHelper.checkScopeAccess(device, resourceScope);
        if (!hasAccess) {
            throw new HttpException(
                `You don't have permission to update users on Biometric Device ${setUserDto.deviceId}`,
                HttpStatus.FORBIDDEN
            );
        }

        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(setUserDto.deviceId);

        return await service.updateUser(
            setUserDto.deviceId,
            setUserDto
        );
    }

    // TODO: Delete user endpoint
    // @Delete('devices/:deviceId/users/:userId')
    // @Authorize({ endpointType: Action.DELETE })
    // @ApiOperation({ summary: 'Delete a user from a biometric device' })
    // @ApiParam({
    //     name: 'deviceId',
    //     description: 'Target device ID',
    //     type: String,
    //     example: "10.10.10.100:5010"
    // })
    // @ApiParam({
    //     name: 'biometricUserId',
    //     description: 'User ID to delete',
    //     type: Number,
    //     example: 1001
    // })
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     description: 'User deleted successfully',
    //     type: GeneralResponseDto
    // })
    // @ApiResponse({
    //     status: HttpStatus.NOT_FOUND,
    //     description: 'Device or user not found',
    //     type: GeneralResponseDto
    // })
    // @ApiGenericResponses()
    // async deleteUser(
    //     @Req() req: any,
    //     @Param('deviceId') deviceId: string,
    //     @Param('biometricUserId') biometricUserId: number
    // ): Promise<Partial<GeneralResponseDto>> {
    //     // Get the device information first to check access scope
    //     const device = await this.biometricDevicesService.findOneBy({ deviceId: deviceId });
    //     if (!device) {
    //         throw new HttpException(
    //             `Biometric Device ${deviceId} not found`,
    //             HttpStatus.NOT_FOUND
    //         );
    //     }

    //     // Get resource scope from request
    //     const resourceScope = req.resourceScope;

    //     // Check if user has access to this device based on scope
    //     const hasAccess = UtilityHelper.checkScopeAccess(device, resourceScope);
    //     if (!hasAccess) {
    //         throw new HttpException(
    //             `You don't have permission to delete users on Biometric Device ${deviceId}`,
    //             HttpStatus.FORBIDDEN
    //         );
    //     }

    //     const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        
    //     const result = await service.deleteUser(deviceId, biometricUserId);
        
    //     return {
    //         message: result 
    //             ? `User ${biometricUserId} deleted successfully from device ${deviceId}` 
    //             : `Failed to delete user ${biometricUserId} from device ${deviceId}`
    //     };
    // }

    @Get('devices/:deviceId/users')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Get users registered on a biometric device' })
    @ApiParam({
        name: 'deviceId',
        description: 'Target device ID',
        type: String,
        example: "10.10.10.100:5010"
    })
    @ApiResponse({ 
        status: HttpStatus.OK,
        description: 'List of users retrieved successfully',
        type: [BiometricUserDto]
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Biometric Device not found',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async getUsers(@Req() req: any, @Param('deviceId') deviceId: string): Promise<BiometricUserDto[]> {
        // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneBy({ deviceId: deviceId });
        if (!device) {
            throw new HttpException(
                `Biometric Device ${deviceId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        // Get resource scope from request
        const resourceScope = req.resourceScope;
        // Check if user has access to this device based on scope
        const hasAccess = UtilityHelper.checkScopeAccess(device, resourceScope);
        if (!hasAccess) {
            throw new HttpException(
                `You don't have permission to access users on Biometric Device ${deviceId}`,
                HttpStatus.FORBIDDEN
            );
        }

        const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
        return await service.getUsers(deviceId);
    }

    @Get('devices/:deviceId/users/:biometricUserId')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Get a specific user by ID from a biometric device' })
    @ApiParam({
        name: 'deviceId',
        description: 'Target device ID',
        type: String
    })
    @ApiParam({
        name: 'biometricUserId',
        description: 'User ID in the biometric device',
        type: Number
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User retrieved successfully',
        type: BiometricUserDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'User or device not found',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async getUserById(@Req() req: any, @Param() params: GetBiometricUserDto): Promise<BiometricUserDto> {
        // Get the device information first to check access scope
        const device = await this.biometricDevicesService.findOneBy({ deviceId: params.deviceId });
        if (!device) {
            throw new NotFoundException(
                `Biometric Device ${params.deviceId} not found`,
            );
        }

        // Get resource scope from request
        const resourceScope = req.resourceScope;
        // Check if user has access to this device based on scope
        const hasAccess = UtilityHelper.checkScopeAccess(device, resourceScope);
        if (!hasAccess) {
            throw new ForbiddenException(
                `You don't have permission to access user ${params.biometricUserId} on Biometric Device ${params.deviceId}`,
            );
        }

        const service = await this.biometricsFactory.getServiceByDeviceId(params.deviceId);
        return await service.getUserById(params);
    }

    @ApiOperation({ summary: 'Get attendance records from a device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'List of attendance records',
        type: [Object]
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO format)' })
    @Get('devices/:deviceId/attendances')
    async getAttendanceRecords(
        @Param('deviceId') deviceId: string,
        @Query('startDate') startDateParam?: string,
        @Query('endDate') endDateParam?: string
    ): Promise<{ records: AttendanceRecord[]; count: number; deviceId: string }> {
        try {
            // Parse dates if provided
            const startDate = startDateParam ? new Date(startDateParam) : undefined;
            const endDate = endDateParam ? new Date(endDateParam) : undefined;
            
            // Validate date formats
            if ((startDate && isNaN(startDate.getTime())) || 
                (endDate && isNaN(endDate.getTime()))) {
                throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
            }
            
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const records = await service.getAttendanceRecords(deviceId, startDate, endDate);
            
            return { 
                records,
                count: records.length,
                deviceId
            };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get attendance records',
                'Attendance record retrieval not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Get attendance records size' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Attendance record count',
        type: Number
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Get('devices/:deviceId/attendance/size')
    async getAttendanceSize(
        @Param('deviceId') deviceId: string
    ): Promise<{ size: number; deviceId: string }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const size = await service.getAttendanceSize(deviceId);
            
            return { size, deviceId };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get attendance size',
                'Attendance size retrieval not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Clear attendance records from a device' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Attendance records cleared successfully' })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Delete('devices/:deviceId/attendance')
    async clearAttendanceRecords(
        @Param('deviceId') deviceId: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const result = await service.clearAttendanceRecords(deviceId);
            
            return { 
                success: result,
                message: result 
                ? 'Attendance records cleared successfully' 
                : 'Failed to clear attendance records'
            };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to clear attendance records',
                'Attendance record clearing not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Get device serial number' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Device serial number retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                serialNumber: { type: 'string', example: 'ABC123456' }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Get('devices/:deviceId/serial')
    async getSerialNumber(@Param('deviceId') deviceId: string): Promise<{ deviceId: string; serialNumber: string }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const serialNumber = await service.getSerialNumber(deviceId);
            
            return { deviceId, serialNumber };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get device serial number',
                'Serial number retrieval not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Get device firmware version' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Device firmware version retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                firmwareVersion: { type: 'string', example: '1.2.3' }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Get('devices/:deviceId/firmware')
    async getFirmwareVersion(@Param('deviceId') deviceId: string): Promise<{ deviceId: string; firmwareVersion: string }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const firmwareVersion = await service.getFirmwareVersion(deviceId);
            
            return { deviceId, firmwareVersion };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get device firmware version',
                'Firmware version retrieval not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Restart device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Device restarted successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                success: { type: 'boolean', example: true }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Post('devices/:deviceId/restart')
    async restartDevice(@Param('deviceId') deviceId: string): Promise<{ deviceId: string; success: boolean }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const success = await service.restartDevice(deviceId);
            
            return { deviceId, success };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to restart device',
                'Device restart not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Unlock device door' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Door unlocked successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                success: { type: 'boolean', example: true }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Post('devices/:deviceId/unlock-door')
    async unlockDoor(
        @Param('deviceId') deviceId: string,
        @Body() unlockDoorDto: UnlockDoorDto
    ): Promise<{ deviceId: string; success: boolean }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            // Unlock door with delay (if supported)
            const success = await service.unlockDoor(deviceId);
            
            return { deviceId, success };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to unlock door',
                'Door unlocking not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Sync users between devices' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Users synced successfully',
        schema: {
            type: 'object',
            properties: {
                sourceDeviceId: { type: 'string', example: '192.168.1.100:4370' },
                targetDeviceId: { type: 'string', example: '192.168.1.101:4370' },
                count: { type: 'number', example: 10 }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @Post('devices/sync-users')
    async syncUsers(@Body() syncUsersDto: SyncUsersDto): Promise<{ sourceDeviceId: string; targetDeviceId: string; count: number }> {
        try {
            const { sourceDeviceId, targetDeviceId } = syncUsersDto;
            
            // Get the appropriate service based on source device ID (could also check target device type)
            const service = await this.biometricsFactory.getServiceByDeviceId(sourceDeviceId);
            
            const count = await service.syncUsers(sourceDeviceId, targetDeviceId);
            
            return { sourceDeviceId, targetDeviceId, count };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to sync users between devices',
                'User synchronization not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Get user details including fingerprint info' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User details retrieved successfully',
        type: [Object]
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Get('devices/:deviceId/user-details')
    async getUserDetails(@Param('deviceId') deviceId: string): Promise<IBiometricUser[]> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            return await service.getUserDetails(deviceId);
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get user details',
                'User details retrieval not supported by this device type'
            );
        }
    }
}