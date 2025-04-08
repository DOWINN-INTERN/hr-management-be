import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { BiometricDevice } from '../entities/biometric-device.entity';
import { BiometricTemplate } from '../entities/biometric-template.entity';
import {
  AttendanceRecord,
  IBiometricDevice,
  IBiometricService,
  IBiometricTemplate,
  IBiometricUser
} from '../interfaces/biometric.interface';

/**
 * Base exception class for biometric-related errors
 */
export class BiometricException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode);
  }
}

/**
 * Abstract base class for all biometric service implementations
 * Provides common functionality and defines the interface that all biometric services must implement
 */
export abstract class BaseBiometricsService implements Partial<IBiometricService> {
    // Make logger protected so it can be inherited by derived classes
    protected readonly logger = new Logger(this.constructor.name);
    protected readonly connections: Map<string, any> = new Map();
    protected readonly activeMonitoring: Map<string, { deviceId: string, callback?: Function, intervalId?: number }> = new Map();
    protected devices: Map<string, IBiometricDevice> = new Map();

    constructor(
        protected readonly deviceRepository: Repository<BiometricDevice>,
        protected readonly templateRepository: Repository<BiometricTemplate>,
        protected readonly eventEmitter: EventEmitter2, // Replace with actual event emitter type
    ) {
        this.initializeFromDatabase();
    }


    /**
     * Load previously connected devices from database on service startup
     */
    private async initializeFromDatabase(): Promise<void> {
        try {
        const savedDevices = await this.deviceRepository.find();
        
        if (savedDevices.length > 0) {
            this.logger.log(`Found ${savedDevices.length} previously connected devices. Attempting to reconnect...`);
            
            // Try to reconnect to devices in parallel
            await Promise.allSettled(
            savedDevices.map(device => 
                this.connect(device.ipAddress, device.port)
                .catch(err => {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    this.logger.warn(`Failed to reconnect to device ${device.id}: ${errorMessage}`);
                })
            )
            );
        }
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error initializing devices from database: ${errorMessage}`);
        }
    }

    /**
     * Clean up resources when module is destroyed
     */
    async onModuleDestroy(): Promise<void> {
        this.logger.log('Module destroying, disconnecting from all devices...');
        
        // Close all connections when service is destroyed
        const disconnectPromises = Array.from(this.connections.entries()).map(
        ([deviceId]) => this.disconnect(deviceId)
        );
        
        await Promise.allSettled(disconnectPromises);
        this.logger.log('All device connections closed');
    }
  
    emitAttendanceEvent(record: AttendanceRecord): void {
        try {
            this.eventEmitter.emit('biometric.attendance', record);
        } catch (error) {
            this.logger.error(`Error emitting attendance event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    abstract getUserFingerprint(
        deviceId: string,
        userId: string,
        fingerId?: number
    ): Promise<IBiometricTemplate | null>;

    abstract registerUser(
        deviceId: string, 
        userData: {
            userId: string;
            name: string;
            password?: string;
            cardNumber?: string;
            role?: number;
        }
    ): Promise<IBiometricUser>;

    /**
     * Connect to a Biometric device
     * @param ipAddress Device IP address
     * @param port Device port
     * @returns Connected device information
     */
    async connect(ipAddress: string, port: number): Promise<IBiometricDevice | null> {
        if (!ipAddress || !port) {
        throw new BiometricException('IP address and port are required', HttpStatus.BAD_REQUEST);
        }

        const deviceId = this.generateDeviceId(ipAddress, port);
        
        // Check if already connected
        if (this.connections.has(deviceId)) {
            this.logger.warn(`Device ${deviceId} is already connected`);
            return this.devices.get(deviceId) ?? null;
        }

        // Create new connection with retry logic
        return this.connectWithRetry(deviceId, ipAddress, port);
    }

    abstract connectWithRetry(deviceId: string, 
        ipAddress: string,
        port: number
    ): Promise<IBiometricDevice>;

    abstract disconnect(deviceId: string): Promise<boolean>;
  
    // Device information methods (optional with default implementation)
    async getDeviceInfo(deviceId: string): Promise<Record<string, any>> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async getSerialNumber(deviceId: string): Promise<string> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async getFirmwareVersion(deviceId: string): Promise<string> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async getDeviceName(deviceId: string): Promise<string> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async restartDevice(deviceId: string): Promise<boolean> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    // Time management methods (optional)
    async getTime(deviceId: string): Promise<Date> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async setTime(deviceId: string, time: Date): Promise<boolean> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    // User management methods (optional)
    async enrollUser(deviceId: string, userId: string, fingerId: number): Promise<IBiometricTemplate> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async deleteUser(deviceId: string, userId: string): Promise<boolean> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async getUsers(deviceId: string): Promise<IBiometricUser[]> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
    
    async getUserDetails(deviceId: string): Promise<IBiometricUser[]> {
        throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
    }
  
  async setUser(
    deviceId: string,
    uid: number,
    userId: string,
    name: string,
    password?: string,
    role?: number,
    cardno?: number
  ): Promise<boolean> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  async syncUsers(sourceDeviceId: string, targetDeviceId: string): Promise<number> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  // Attendance management methods (optional)
  async getAttendanceRecords(deviceId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  async clearAttendanceRecords(deviceId: string): Promise<boolean> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  async getAttendanceSize(deviceId: string): Promise<number> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  // Real-time monitoring methods (optional)
  startRealTimeMonitoring(deviceId: string, callback: (record: AttendanceRecord) => void): string {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  stopRealTimeMonitoring(monitoringId: string): boolean {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  // Door control (optional)
  async unlockDoor(deviceId: string): Promise<boolean> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
  
  // Command execution (optional)
  async executeCommand(deviceId: string, command: string, data?: string): Promise<any> {
    throw new BiometricException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  /**
   * Get all connected devices
   * @returns Array of connected biometric devices
   */
  getConnectedDevices(): Promise<IBiometricDevice[]> {
    return Promise.resolve(Array.from(this.devices.values()));
  }

  /**
   * Get a device by ID, throwing an exception if not found
   * @param deviceId Device identifier
   * @returns Device information
   */
  protected getDevice(deviceId: string): IBiometricDevice {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new BiometricException(
        `Device with ID ${deviceId} not found or not connected`,
        HttpStatus.NOT_FOUND
      );
    }
    return device;
  }

  /**
   * Generate a unique device ID from IP address and port
   * @param ipAddress Device IP address
   * @param port Device port
   * @returns Unique device identifier
   */
  protected generateDeviceId(ipAddress: string, port: number): string {
    return `${ipAddress}:${port}`;
  }

  /**
   * Safely handle errors by ensuring proper type conversion
   * @param error The error to process
   * @returns Standardized error message string
   */
  protected formatErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}