import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ErrorResponseDto } from './dtos/error-response.dto';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AttendanceRecord, IBiometricTemplate, IBiometricUser } from './interfaces/biometric.interface';
import { BiometricDevicesService } from './services/biometric-devices.service';
import { BiometricsFactoryService } from './services/biometrics-factory.service';
import { SetUserDto } from './dtos/set-user.dto';

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

    @ApiOperation({ summary: 'Register a new user on a biometric device' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'User registered successfully',
        type: Object
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid input data',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @Post('users/register')
    async registerUser(
        @Body() setUserDto: SetUserDto
    ): Promise<IBiometricUser> {
        // Get the appropriate service based on the device ID
        const service = await this.biometricsFactory.getServiceByDeviceId(setUserDto.deviceId);
        
        return await service.registerUser(
            setUserDto.deviceId,
            {
                userId: setUserDto.userId,
                name: setUserDto.name,
                password: setUserDto.password,
                cardNumber: setUserDto.cardNumber,
                role: setUserDto.role
            }
        );
    }

    @ApiOperation({ summary: 'Set device time' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Device time set successfully' })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid time format',
        type: ErrorResponseDto
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
    @Put('devices/:deviceId/time')
    async setTime(
        @Param('deviceId') deviceId: string,
        @Body() body: { time?: string }
    ): Promise<{ success: boolean }> {
        try {
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
            
            return { success: result };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to set device time',
                'Time setting not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Delete a user from a device' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device or user not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid user ID format',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.INTERNAL_SERVER_ERROR, 
        description: 'Error deleting user',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @ApiParam({ name: 'userId', description: 'User ID to delete' })
    @Delete('devices/:deviceId/users/:userId')
    async deleteUser(
        @Param('deviceId') deviceId: string,
        @Param('userId') userId: string
    ): Promise<{ success: boolean }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const result = await service.deleteUser(deviceId, userId);
            
            return { success: result };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to delete user',
                'User deletion not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Get users registered on a device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'List of user IDs',
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
    @Get('devices/:deviceId/users')
    async getUsers(@Param('deviceId') deviceId: string): Promise<IBiometricUser[]> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            return await service.getUsers(deviceId);
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get users',
                'User retrieval not supported by this device type'
            );
        }
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
    @Get('devices/:deviceId/attendance')
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

    @ApiOperation({ summary: 'Get device time' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Device time retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                time: { type: 'string', format: 'date-time', example: '2025-05-06T12:00:00.000Z' }
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
    @Get('devices/:deviceId/time')
    async getTime(@Param('deviceId') deviceId: string): Promise<{ deviceId: string; time: Date }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const time = await service.getTime(deviceId);
            
            return { deviceId, time };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get device time',
                'Time retrieval not supported by this device type'
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

    @ApiOperation({ summary: 'Execute custom command on device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Command executed successfully',
        schema: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', example: '192.168.1.100:4370' },
                command: { type: 'string', example: 'get_device_info1' },
                result: { type: 'object', additionalProperties: true }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid command',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_IMPLEMENTED, 
        description: 'Feature not implemented on this device',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Post('devices/:deviceId/command')
    async executeCommand(
        @Param('deviceId') deviceId: string,
        @Body() executeCommandDto: ExecuteCommandDto
    ): Promise<{ deviceId: string; command: string; result: any }> {
        try {
            const { command, data } = executeCommandDto;
            
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const result = await service.executeCommand(deviceId, command, data);
            
            return { deviceId, command, result };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to execute command',
                'Command execution not supported by this device type'
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