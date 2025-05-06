import { BiometricDeviceType } from '@/common/enums/biometrics-device-type.enum';
import { HttpException, HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { ConnectDeviceDto } from '../dtos/connect-device.dto';
import { BiometricDevice } from '../entities/biometric-device.entity';
import {
  AttendanceRecord,
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

    constructor(
      protected readonly deviceRepository: Repository<BiometricDevice>,
      protected readonly eventEmitter: EventEmitter2,
    ) {
      this.initializeFromDatabase();
    }


    /**
     * Load previously connected devices from database on service startup
     */
    private async initializeFromDatabase(): Promise<void> {
        try {
        const savedDevices = await this.deviceRepository.find({ where: { isConnected: true } });
        
        if (savedDevices.length > 0) {            
            // Try to reconnect to devices in parallel
            await Promise.allSettled(
              savedDevices.map(device => 
                  // convert device to ConnectDeviceDto using class transformer
                  this.connect({
                      deviceId: device.deviceId,
                      ipAddress: device.ipAddress,
                      port: device.port,
                      deviceType: device.provider
                  } as ConnectDeviceDto)
                  .catch()
              )
            );
        }
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error initializing devices from database: ${errorMessage}`);
        }
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
    async connect(dto: ConnectDeviceDto): Promise<BiometricDevice> {
        if (this.biometricDeviceType !== dto.deviceType) {
            throw new InternalServerErrorException(
                `Device type mismatch: expected ${this.biometricDeviceType}, got ${dto.deviceType}`
            );
        }

        const deviceId = this.generateDeviceId(dto.ipAddress, dto.port);

        // Create new connection with retry logic
        return await this.connectWithRetry(dto, deviceId);

    }

    /**
   * Update device connection and online status in memory and database
   * @param deviceId Device identifier
   * @param isConnected Whether the device is connected
   * @param isOffline Whether the device is considered offline
   * @returns Updated device information
   */
  async updateDeviceStatus(
    deviceId: string, 
    isConnected: boolean, 
    isOffline: boolean
  ): Promise<BiometricDevice> {
      // Find the device in the database
      let device = await this.deviceRepository.findOne({ where: { deviceId } });
      
      if (!device) {
          this.logger.warn(`Device ${deviceId} not found in database during status update`);
          throw new BiometricException(`Device ${deviceId} not found`, HttpStatus.NOT_FOUND);
      }
      
      // Update properties
      device.isConnected = isConnected;
      device.isOffline = isOffline;
      
      // Update lastSync for successful connections
      if (isConnected) {
          device.lastSync = new Date();
      }
      
      // Save to database
      device = await this.deviceRepository.save(device);
      
      return device;
  }

    abstract biometricDeviceType: BiometricDeviceType;

    abstract connectWithRetry(
      dto: ConnectDeviceDto,
      deviceId: string
    ): Promise<BiometricDevice>;

    abstract disconnect(deviceId: string, isManual: boolean): Promise<BiometricDevice>;
  
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