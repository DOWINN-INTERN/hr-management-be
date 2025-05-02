import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsInt, IsIP, IsOptional, Max, Min } from 'class-validator';
import { ErrorResponseDto } from './dtos/error-response.dto';
import { BiometricDevice, BiometricDeviceType } from './entities/biometric-device.entity';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AttendanceRecord, IBiometricDevice, IBiometricService, IBiometricTemplate, IBiometricUser } from './interfaces/biometric.interface';
import { BiometricDevicesService } from './services/biometric-devices.service';
import { BiometricsFactoryService } from './services/biometrics-factory.service';

class ConnectDeviceDto {
    @ApiProperty({
        description: 'Device IP address',
        example: '192.168.1.100'
    })
    @IsIP(4)
    ipAddress!: string;

    @ApiProperty({
        description: 'Device port number',
        example: 4370,
        default: 4370
    })
    @IsInt()
    @Min(1)
    @Max(65535)
    port: number = 4370;

    @ApiProperty({
        description: 'Device type/manufacturer',
        enum: BiometricDeviceType,
        default: BiometricDeviceType.ZKTECO,
        example: 'zkteco'
    })
    @IsEnum(BiometricDeviceType)
    @IsOptional()
    deviceType?: string = BiometricDeviceType.ZKTECO;
}

class SetUserDto {
    @ApiProperty({
        description: 'Device ID to register user on',
        example: '192.168.1.100:4370'
    })
    deviceId!: string;

    @ApiProperty({
        description: 'User ID',
        example: '1001'
    })
    userId!: string;

    @ApiProperty({
        description: 'User name',
        example: 'John Doe'
    })
    name!: string;

    @ApiProperty({
        description: 'User password',
        example: '1234',
        required: false
    })
    @IsOptional()
    password?: string;

    @ApiProperty({
        description: 'User card number',
        example: '8987656789',
        required: false
    })
    @IsOptional()
    cardNumber?: string;

    @ApiProperty({
        description: 'User role (0=normal, 14=admin)',
        example: 0,
        required: false
    })
    @IsOptional()
    role?: number;
}

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

@ApiTags('Biometrics')
@Controller()
@UseInterceptors(new TimeoutInterceptor(30))
export class BiometricsController {
    constructor(
        @Inject('BIOMETRIC_SERVICE')
        private readonly defaultBiometricService: IBiometricService,
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
        try {
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
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to register user',
                'User registration not supported by this device type'
            );
        }
    }

    @ApiOperation({ summary: 'Connect to a biometric device' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Device connected successfully',
        type: Object 
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Invalid input data',
        type: ErrorResponseDto 
    })
    @ApiResponse({ 
        status: HttpStatus.SERVICE_UNAVAILABLE, 
        description: 'Device connection failed',
        type: ErrorResponseDto 
    })
    @ApiBody({
        type: ConnectDeviceDto,
        description: 'Device connection parameters'

    })
    @Post('devices/connect')
    async connectDevice(
        @Body() connectDeviceDto: ConnectDeviceDto
    ): Promise<IBiometricDevice | null> {
        try {
            // Use the appropriate service based on device type
            const service = this.biometricsFactory.getService(
                connectDeviceDto.deviceType || BiometricDeviceType.ZKTECO
            );
            
            const device = await service.connect(
                connectDeviceDto.ipAddress,
                connectDeviceDto.port
            );
            
            // If connection was successful, update or create device in database
            if (device) {
                // Create a BiometricDevice entity instance
                const biometricDevice = new BiometricDevice({});
                
                // Set properties from device object
                Object.assign(biometricDevice, {
                    ...device,
                    provider: connectDeviceDto.deviceType || BiometricDeviceType.ZKTECO
                });
                
                // Save additional info to database
                await this.biometricDevicesService.save(biometricDevice);
            }
            
            return device;
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                `Failed to connect to device: ${this.getErrorMessage(error)}`,
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }

    @ApiOperation({ summary: 'Disconnect from a biometric device' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Device disconnected successfully' })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Device ID to disconnect from' })
    @Post('devices/:deviceId/disconnect')
    async disconnectDevice(@Param('deviceId') deviceId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            const result = await service.disconnect(deviceId);
            
            // Update database record
            if (result) {
                await this.biometricDevicesService.update(deviceId, {
                    isConnected: false
                });
            }
            
            return {
                success: result,
                message: result 
                    ? 'Device disconnected successfully' 
                    : 'Device disconnect failed'
            };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to disconnect device',
                'Device disconnection failed'
            );
        }
    }

    @ApiOperation({ summary: 'Get all connected biometric devices' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'List of connected devices',
        type: [Object]
    })
    @Get('devices')
    async getConnectedDevices(): Promise<IBiometricDevice[]> {
        try {
            // Get all devices from database
            const devices = await this.biometricDevicesService.getRepository().find({
                where: { isConnected: true }
            });
            
            return devices;
        } catch (error: unknown) {
            throw new HttpException(
                `Failed to get connected devices: ${this.getErrorMessage(error)}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @ApiOperation({ summary: 'Get device information' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Device information' })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Device not found',
        type: ErrorResponseDto
    })
    @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    @Get('devices/:deviceId/info')
    async getDeviceInfo(@Param('deviceId') deviceId: string): Promise<Record<string, any>> {
        try {
            // Get the appropriate service based on the device ID
            const service = await this.biometricsFactory.getServiceByDeviceId(deviceId);
            
            return await service.getDeviceInfo(deviceId);
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get device information',
                'Device information retrieval not supported by this device type'
            );
        }
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
}