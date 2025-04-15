import { GeneralResponseDto as ErrorResponseDto } from '@/common/dtos/generalresponse.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConnectDeviceDto } from './dtos/connect-device.dto';
import { SetTimeDto } from './dtos/set-time.dto';
import { SetUserDto } from './dtos/set-user.dto';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AttendanceRecord, IBiometricDevice, IBiometricService, IBiometricUser } from './interfaces/biometric.interface';

@ApiTags('Biometrics')
@Controller()
@UseInterceptors(new TimeoutInterceptor(30))
export class BiometricsController {
    constructor(
        @Inject('BIOMETRIC_SERVICE')
        private readonly biometricService: IBiometricService
    ) {}

    // Helper method for consistent error handling
    private handleError(error: unknown, defaultMessage: string, notImplementedMessage?: string): never {
        if (error instanceof HttpException) {
            throw error;
        }
        
        const errorMessage = this.getErrorMessage(error);
        
        if (notImplementedMessage && errorMessage.includes('not implemented')) {
            throw new HttpException(
                notImplementedMessage,
                HttpStatus.NOT_IMPLEMENTED
            );
        }
        
        throw new HttpException(
            `${defaultMessage}: ${errorMessage}`,
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  
    // Helper to safely extract error messages
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            return error.message;
        }
        return String(error);
    }

    // @ApiOperation({ summary: 'Get fingerprint template for a user' })
    // @ApiResponse({ 
    // status: HttpStatus.OK, 
    // description: 'Fingerprint template retrieved successfully',
    // schema: {
    //     type: 'object',
    //     properties: {
    //     id: { type: 'string', example: '1001-0' },
    //     userId: { type: 'string', example: '1001' },
    //     fingerId: { type: 'number', example: 0 },
    //     template: { type: 'string', format: 'binary', description: 'Binary template data' },
    //     provider: { type: 'string', example: 'zkteco' }
    //     }
    // }
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Template or device not found',
    //     type: ErrorResponseDto
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid request',
    //     type: ErrorResponseDto
    // })
    // @Get('users/fingerprint')
    // async getUserFingerprint(
    //     @Query(new ValidationPipe({ transform: true })) getFingerprintDto: GetFingerprintDto
    // ): Promise<IBiometricTemplate | null> {
    //     try {
    //         const { deviceId, userId, fingerId = 0 } = getFingerprintDto;
            
    //         const template = await this.biometricService.getUserFingerprint(
    //             deviceId,
    //             userId,
    //             fingerId
    //         );
            
    //         if (!template) {
    //             throw new NotFoundException(`No fingerprint template found for user ${userId} (finger ${fingerId})`);
    //         }
            
    //         return template;
    //     } catch (error: unknown) {
    //         return this.handleError(
    //             error,
    //             'Failed to retrieve fingerprint template',
    //             'Fingerprint template not found or retrieval not supported by this device type'
    //         );
    //     }
    // }

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
            return await this.biometricService.registerUser(
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

    // =============================================
    // Device Management Endpoints
    // =============================================
    
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
    @Post('devices/connect')
    async connectDevice(
        @Body(new ValidationPipe({ transform: true })) connectDeviceDto: ConnectDeviceDto
    ): Promise<IBiometricDevice | null> {
        try {
            return await this.biometricService.connect(
                connectDeviceDto.ipAddress,
                connectDeviceDto.port
            );
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
            const result = await this.biometricService.disconnect(deviceId);
            return { 
                success: result, 
                message: result ? 'Device disconnected successfully' : 'Device disconnection initiated'
            };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to disconnect device',
                'Device disconnection not supported by this device type'
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
    async getConnectedDevices(): Promise<{ devices: IBiometricDevice[]; count: number }> {
        const devices = await this.biometricService.getConnectedDevices();
            return { 
            devices,
            count: devices.length
        };
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
    async getDeviceInfo(
        @Param('deviceId') deviceId: string
    ): Promise<Record<string, any>> {
        try {
            return await this.biometricService.getDeviceInfo(deviceId);
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get device information',
                'Device information retrieval not supported by this device type'
            );
        }
    }

    // @ApiOperation({ summary: 'Restart a biometric device' })
    // @ApiResponse({ status: HttpStatus.OK, description: 'Device restarted successfully' })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    // })
    // @ApiParam({ name: 'deviceId', description: 'Device ID to restart' })
    // @Post('devices/:deviceId/restart')
    // async restartDevice(
    //     @Param('deviceId') deviceId: string
    // ): Promise<{ success: boolean; message: string }> {
    //     try {
    //     const result = await this.biometricService.restartDevice?.(deviceId);
    //     return { 
    //         success: result,
    //         message: result ? 'Device restart initiated' : 'Device restart failed'
    //     };
    //     } catch (error: unknown) {
    //     return this.handleError(
    //         error,
    //         'Failed to restart device',
    //         'Device restart not supported by this device type'
    //     );
    //     }
    // }

    //   @ApiOperation({ summary: 'Unlock a device door' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Door unlocked successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Post('devices/:deviceId/unlock')
    //   async unlockDoor(
    //     @Param('deviceId') deviceId: string
    //   ): Promise<{ success: boolean; message: string }> {
    //     try {
    //       const result = await this.biometricService.unlockDoor?.(deviceId);
    //       return { 
    //         success: result,
    //         message: result ? 'Door unlocked successfully' : 'Failed to unlock door'
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to unlock door',
    //         'Door unlock not supported by this device type'
    //       );
    //     }
    //   }

    //   @ApiOperation({ summary: 'Execute a custom command on a device' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Command executed successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid command',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Post('devices/:deviceId/command')
    //   async executeCommand(
    //     @Param('deviceId') deviceId: string,
    //     @Body(new ValidationPipe({ transform: true })) commandDto: CommandDto
    //   ): Promise<{ success: boolean; result: any }> {
    //     try {
    //       const result = await this.biometricService.executeCommand?.(
    //         deviceId, 
    //         commandDto.command,
    //         commandDto.data
    //       );
    //       return { 
    //         success: true,
    //         result
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to execute command',
    //         'Command execution not supported by this device type'
    //       );
    //     }
    //   }

    //   @ApiOperation({ summary: 'Get device time' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Current device time' })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Get('devices/:deviceId/time')
    //   async getTime(
    //     @Param('deviceId') deviceId: string
    //   ): Promise<{ deviceId: string; time: Date }> {
    //     try {
    //       const time = await this.biometricService.getTime?.(deviceId);
    //       return { deviceId, time };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to get device time',
    //         'Time retrieval not supported by this device type'
    //       );
    //     }
    //   }

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
        @Body(new ValidationPipe({ transform: true })) timeDto: SetTimeDto
    ): Promise<{ success: boolean; message: string }> {
        try {
        const time = new Date(timeDto.time);
        const result = await this.biometricService.setTime?.(deviceId, time);
        return { 
            success: result,
            message: result ? 'Device time set successfully' : 'Failed to set device time'
        };
        } catch (error: unknown) {
        return this.handleError(
            error,
            'Failed to set device time',
            'Time setting not supported by this device type'
        );
        }
    }

  // =============================================
  // User & Template Management Endpoints
  // =============================================

    //   @ApiOperation({ summary: 'Enroll a user fingerprint' })
    //   @ApiResponse({ 
    //     status: HttpStatus.CREATED, 
    //     description: 'User fingerprint enrolled successfully',
    //     type: Object
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('users/enroll')
    //   async enrollUser(
    //     @Body(new ValidationPipe({ transform: true })) enrollUserDto: EnrollUserDto
    //   ): Promise<IBiometricTemplate> {
    //     try {
    //       return await this.biometricService.enrollUser(
    //         enrollUserDto.deviceId,
    //         enrollUserDto.userId,
    //         enrollUserDto.fingerId
    //       );
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to enroll user',
    //         'User enrollment not supported by this device type'
    //       );
    //     }
    //   }

    //   @ApiOperation({ summary: 'Create or update a user on a device' })
    //   @ApiResponse({ 
    //     status: HttpStatus.CREATED, 
    //     description: 'User created/updated successfully',
    //     type: Object
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('devices/:deviceId/users')
    //   async setUser(
    //     @Param('deviceId') deviceId: string,
    //     @Body(new ValidationPipe({ transform: true })) userDto: SetUserDto
    //   ): Promise<{ success: boolean; message: string }> {
    //     try {
    //       const result = await this.biometricService.setUser?.(
    //         deviceId,
    //         userDto.uid,
    //         userDto.userId,
    //         userDto.name,
    //         userDto.password,
    //         userDto.role,
    //         userDto.cardno
    //       );
    //       return { 
    //         success: result,
    //         message: result 
    //           ? `User ${userDto.userId} created/updated successfully` 
    //           : `Failed to create/update user ${userDto.userId}`
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to create/update user',
    //         'User creation not supported by this device type'
    //       );
    //     }
    //   }

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
    ): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.biometricService.deleteUser(deviceId, userId);
            return { 
                success: result,
                message: result ? `User ${userId} successfully deleted` : `Failed to delete user ${userId}`
            };
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to delete user',
                'User deletion not supported by this device type'
            );
        }
    }

    //   @ApiOperation({ summary: 'Verify a fingerprint' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Verification result' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('verify')
    //   async verifyFingerprint(
    //     @Body(new ValidationPipe({ transform: true })) verifyDto: VerifyFingerprintDto
    //   ): Promise<{ verified: boolean; userId: string }> {
    //     try {
    //       const result = await this.biometricService.verifyFingerprint(
    //         verifyDto.deviceId,
    //         verifyDto.template
    //       );
    //       return { 
    //         verified: result,
    //         userId: verifyDto.template.userId
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to verify fingerprint',
    //         'Fingerprint verification not supported by this device type'
    //       );
    //     }
    //   }

    //   @ApiOperation({ summary: 'Sync users between two devices' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Users synced successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('devices/sync')
    //   async syncUsers(
    //     @Body(new ValidationPipe({ transform: true })) syncUsersDto: SyncUsersDto
    //   ): Promise<{ syncedCount: number; success: boolean; message: string }> {
    //     try {
    //       const count = await this.biometricService.syncUsers?.(
    //         syncUsersDto.sourceDeviceId,
    //         syncUsersDto.targetDeviceId
    //       );
        
    //       return { 
    //         syncedCount: count,
    //         success: count > 0,
    //         message: count > 0 
    //           ? `Successfully synced ${count} users` 
    //           : 'No users were synced'
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to sync users',
    //         'User synchronization not supported by this device type'
    //       );
    //     }
    //   }

    // =============================================
    // Data Operation Endpoints
    // =============================================

    @ApiOperation({ summary: 'Get users registered on a device' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'List of user IDs',
        type: [String]
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
    async getUsers(
        @Param('deviceId') deviceId: string
    ): Promise<IBiometricUser[]> {
        try {
            return await this.biometricService.getUsers(deviceId);
        } catch (error: unknown) {
            return this.handleError(
                error,
                'Failed to get users',
                'User listing not supported by this device type'
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
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<{ records: AttendanceRecord[]; count: number; deviceId: string }> {
        try {
        const records = await this.biometricService.getAttendanceRecords(
            deviceId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
        
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
            const size = await this.biometricService.getAttendanceSize?.(deviceId);
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
        const result = await this.biometricService.clearAttendanceRecords(deviceId);
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