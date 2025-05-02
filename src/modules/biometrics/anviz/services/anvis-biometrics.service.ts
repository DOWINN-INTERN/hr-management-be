import { HttpStatus, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricDevice } from '../../entities/biometric-device.entity';
import { BiometricTemplate } from '../../entities/biometric-template.entity';
import { AttendanceRecord, IBiometricDevice, IBiometricTemplate, IBiometricUser } from '../../interfaces/biometric.interface';
import { BaseBiometricsService, BiometricException } from '../../services/base-biometrics.service';
import { BiometricsPollingService } from '../../services/biometrics-polling.service';
import { AnvizEdgeWrapper } from '../lib/anviz-edge-wrapper';

/**
 * Anviz implementation of the biometric service
 * Handles communication with Anviz biometric devices
 */
@Injectable()
export class AnvizBiometricsService extends BaseBiometricsService implements OnModuleDestroy {
  protected readonly logger = new Logger(AnvizBiometricsService.name);
  
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BiometricDevice)
    protected readonly deviceRepository: Repository<BiometricDevice>,
    private readonly biometricsPollingService: BiometricsPollingService,
    @InjectRepository(BiometricTemplate)
    protected readonly templateRepository: Repository<BiometricTemplate>,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(deviceRepository, templateRepository, eventEmitter);
    
    // Listen for attendance events from polling service
    this.eventEmitter.on('attendance.recorded', (record: AttendanceRecord) => {
      this.emitAttendanceEvent(record);
      
      // Call any registered callback
      const monitorInfo = this.activeMonitoring.get(record.deviceId);
      if (monitorInfo && typeof monitorInfo.callback === 'function') {
        monitorInfo.callback(record);
      }
    });
  }

  /**
   * Connect to an Anviz device with retry logic
   * @param deviceId Device identifier
   * @param ipAddress Device IP address
   * @param port Device port
   * @returns Connected device information
   */
  async connectWithRetry(
    deviceId: string, 
    ipAddress: string,
    port: number
  ): Promise<IBiometricDevice> {
    const timeout = this.configService.get<number>('ANVIZ_TIMEOUT', 5000);
    const retryAttempts = this.configService.get<number>('ANVIZ_RETRY_ATTEMPTS', 3);
    const retryDelay = this.configService.get<number>('ANVIZ_RETRY_DELAY', 1000);
    
    let attempts = 0;
    let lastError: Error = new Error('No connection attempts made');

    while (attempts < retryAttempts) {
      try {
        attempts++;
        this.logger.log(`Connecting to Anviz device ${deviceId} (attempt ${attempts}/${retryAttempts})...`);

        // Create Anviz client
        const anvizClient = new AnvizEdgeWrapper({ 
          host: ipAddress, 
          port: port,
          timeout: timeout,
          deviceId: parseInt(deviceId, 10) || 0
        });

        // Try to connect and get device info
        await anvizClient.connect();
        const deviceInfo = await anvizClient.getDeviceInfo();
        
        this.logger.log(`Successfully connected to Anviz device ${deviceId}`);
        
        // Store connection in map
        this.connections.set(deviceId, anvizClient);
        
        // Store device info
        const device: IBiometricDevice = {
          id: deviceId,
          ipAddress,
          port, // Port is a number as expected by interface
          serialNumber: deviceInfo?.serialNumber || 'Unknown',
          firmware: deviceInfo?.firmwareVersion, // Use firmware instead of firmwareVersion
          platform: 'Anviz', // Default as Anviz doesn't provide platform info
          os: 'Anviz OS', // Default as Anviz doesn't provide OS info
          isConnected: true,
        };
        
        // Store device in devices map
        this.devices.set(deviceId, device);
        
        // Set up device monitoring
        this.setupDeviceMonitoring(deviceId, anvizClient);
        
        // Set up default real-time monitoring
        await this.setupDefaultRealTimeMonitoring(deviceId, anvizClient);
        
        // Start polling for attendance records
        this.biometricsPollingService.registerDeviceConnection(deviceId, anvizClient);
        this.biometricsPollingService.startPolling(deviceId);
        
        // Save to database if not exists
        const existingDevice = await this.deviceRepository.findOne({
          where: { ipAddress, port }
        });
        
        if (!existingDevice) {
          await this.deviceRepository.save({
            id: deviceId,
            ipAddress,
            port: Number(port), // Ensure port is saved as a number
            model: device.model,
            serialNumber: device.serialNumber,
            provider: 'anviz',
            firmware: deviceInfo?.firmwareVersion,
            platform: 'Anviz', // Default value
            os: 'Anviz OS', // Default value
            isConnected: true,
            manufacturer: 'Anviz', // Default manufacturer name
          });
        } else {
          // Update status if device exists
          await this.deviceRepository.update(existingDevice.id, {
            isConnected: true,
            lastSync: new Date(),
            firmware: device.firmware,
            provider: 'anviz'
          });
        }
        
        return device;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Connection attempt ${attempts}/${retryAttempts} failed: ${lastError.message}`);
        
        // If we've reached max attempts, don't wait
        if (attempts >= retryAttempts) break;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we get here, all connection attempts failed
    this.logger.error(`Failed to connect to Anviz device after ${attempts} attempts: ${lastError.message}`);
    throw new BiometricException(
      `Failed to connect to device: ${lastError.message}`, 
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  /**
   * Disconnect from an Anviz device
   * @param deviceId Device identifier
   * @returns True if disconnected successfully
   */
  async disconnect(deviceId: string): Promise<boolean> {
    // Stop the polling first
    this.biometricsPollingService.stopPolling(deviceId);
    
    const anvizClient = this.connections.get(deviceId) as AnvizEdgeWrapper;
    if (!anvizClient) {
      this.logger.warn(`Device ${deviceId} is not connected`);
      return false;
    }

    try {
      // Remove monitoring
      this.activeMonitoring.delete(deviceId);
      
      // Disconnect from the device
      await anvizClient.disconnect();
      
      // Update the database
      await this.deviceRepository.update(
        { id: deviceId },
        { isConnected: false }
      );
      
      // Remove from maps
      this.connections.delete(deviceId);
      this.devices.delete(deviceId);
      
      this.logger.log(`Successfully disconnected from device ${deviceId}`);
      return true;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error disconnecting from device ${deviceId}: ${errorMessage}`);
      throw new BiometricException(`Failed to disconnect: ${errorMessage}`);
    }
  }

  /**
   * Register a new user on the Anviz device without fingerprint enrollment
   * @param deviceId Device identifier
   * @param userData User data to register
   * @returns Created user information
   */
  async registerUser(
    deviceId: string, 
    userData: {
      userId: string;
      name: string;
      password?: string;
      cardNumber?: string;
      role?: number;
    }
  ): Promise<IBiometricUser> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      this.logger.log(`Registering user ${userData.userId} on device ${deviceId}`);
      
      // Prepare parameters with defaults
      const name = userData.name || `User ${userData.userId}`;
      const password = userData.password || '';
      const role = userData.role || 0;
      const cardNo = userData.cardNumber || '';
      
      // Create/update the user on the device
      await anvizClient.addEmployee({
        userId: userData.userId,
        name: name,
        password: password,
        cardNumber: cardNo,
        privilege: role
      });
      
      // Create a standardized user object to return
      const createdUser: IBiometricUser = {
        userId: userData.userId,
        name: name,
        password: password,
        cardNumber: cardNo,
        role: role
      };
      
      this.logger.log(`Successfully registered user ${userData.userId} on device ${deviceId}`);
      return createdUser;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error registering user ${userData.userId}: ${errorMessage}`);
      throw new BiometricException(`Failed to register user: ${errorMessage}`);
    }
  }

  /**
   * Get fingerprint template for a specific user and finger
   * @param deviceId Device identifier
   * @param userId User ID
   * @param fingerId Finger ID (0-9)
   * @returns Fingerprint template data
   */
  async getUserFingerprint(
    deviceId: string,
    userId: string,
    fingerId: number = 0
  ): Promise<IBiometricTemplate | null> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      this.logger.log(`Getting fingerprint template for user ${userId}, finger ${fingerId}`);
      
      // Check first if template exists in database
      const existingTemplate = await this.templateRepository.findOne({
        where: {
          userId,
          fingerId,
          provider: 'anviz'
        }
      });
      
      if (existingTemplate && existingTemplate.template) {
        return {
          id: existingTemplate.id,
          userId,
          fingerId,
          template: existingTemplate.template,
          provider: 'anviz'
        };
      }
      
      // Get the user's fingerprint template from the device
      const templateData = await anvizClient.getFingerprintTemplate(userId, fingerId);
      
      if (!templateData) {
        this.logger.warn(`No fingerprint template found for user ${userId}, finger ${fingerId}`);
        return null;
      }
      
      // Create a standardized template object
      const biometricTemplate: IBiometricTemplate = {
        id: `${userId}-${fingerId}`,
        userId: userId,
        fingerId: fingerId,
        template: templateData,
        provider: 'anviz'
      };
      
      // Save the template to the database - ensure template is properly converted to Buffer
      const templateEntity = this.templateRepository.create({
        userId: userId,
        fingerId: fingerId,
        template: Buffer.isBuffer(templateData) ? templateData : Buffer.from(templateData),
        provider: 'anviz'
      });
      
      await this.templateRepository.save(templateEntity);
      
      this.logger.log(`Successfully retrieved fingerprint template for user ${userId}, finger ${fingerId}`);
      return biometricTemplate;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting fingerprint template for user ${userId}: ${errorMessage}`);
      return null;
    }
  }
  
  /**
   * Set up default real-time monitoring for a device
   * @param deviceId Device identifier 
   * @param anvizClient Anviz device client
   */
  private async setupDefaultRealTimeMonitoring(deviceId: string, anvizClient: AnvizEdgeWrapper): Promise<void> {
    this.logger.log(`Setting up default real-time monitoring for device ${deviceId}`);
    
    try {
      // Enable real-time monitoring
      anvizClient.startMonitoring();
      
      // Set up event listener for real-time events
      anvizClient.on('attendance', (record: any) => {
        // Convert Anviz record to our standardized AttendanceRecord
        const attendanceRecord: AttendanceRecord = {
          deviceId: deviceId,
          userId: record.userId.toString(),
          timestamp: record.timestamp,
          type: this.mapAttendanceTypeToNumber(record.attendanceType),
          verificationMode: this.mapVerificationMethodToNumber(record.verifyMethod)
        };
        
        // Emit the attendance event
        this.emitAttendanceEvent(attendanceRecord);
        
        // Call any registered callback
        const monitorInfo = this.activeMonitoring.get(deviceId);
        if (monitorInfo && typeof monitorInfo.callback === 'function') {
          monitorInfo.callback(attendanceRecord);
        }
      });
      
      // Store in active monitoring with empty callback
      this.activeMonitoring.set(deviceId, { deviceId, callback: undefined });
      
      this.logger.log(`Default real-time monitoring established for device ${deviceId}`);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Failed to set up real-time monitoring: ${errorMessage}`);
    }
  }

  /**
   * Map Anviz attendance type string to standardized number
   */
  private mapAttendanceTypeToNumber(attendanceType: string): number {
    switch (attendanceType) {
      case 'CHECK_IN': return 0;
      case 'CHECK_OUT': return 1;
      case 'BREAK_OUT': return 2;
      case 'BREAK_IN': return 3;
      case 'OVERTIME_IN': return 4;
      case 'OVERTIME_OUT': return 5;
      default: return 0;
    }
  }

  /**
   * Map Anviz verification method string to standardized number
   */
  private mapVerificationMethodToNumber(verifyMode: string): number {
    switch (verifyMode) {
      case 'NONE': return 0;
      case 'FINGER': return 1;
      case 'PASSWORD': return 2;
      case 'CARD': return 3;
      case 'FACE': return 4;
      case 'PALM': return 5;
      default: return 0;
    }
  }

  /**
   * Setup monitoring for device connection status
   * @param deviceId Device identifier
   * @param anvizClient Anviz device client
   */
  private setupDeviceMonitoring(deviceId: string, anvizClient: AnvizEdgeWrapper): void {
    const pingInterval = this.configService.get<number>('DEVICE_PING_INTERVAL', 30000);
    
    const interval = setInterval(async () => {
      try {
        // Ping device to check connection
        const isConnected = await anvizClient.ping();
        
        if (!isConnected) {
          this.logger.warn(`Device ${deviceId} is not responding to ping`);
          
          // Attempt to reconnect
          const device = this.devices.get(deviceId);
          if (device) {
            this.logger.log(`Attempting to reconnect to device ${deviceId}`);
            try {
              await anvizClient.connect();
              this.logger.log(`Reconnected to device ${deviceId}`);
            } catch (error) {
              const errorMessage = this.formatErrorMessage(error);
              this.logger.error(`Failed to reconnect to device ${deviceId}: ${errorMessage}`);
              
              // Update device status
              device.isConnected = false;
              this.devices.set(deviceId, device);
              
              // Update database
              await this.deviceRepository.update(
                { id: deviceId },
                { isConnected: false }
              );
            }
          }
        }
      } catch (error) {
        const errorMessage = this.formatErrorMessage(error);
        this.logger.error(`Error monitoring device ${deviceId}: ${errorMessage}`);
      }
    }, pingInterval);
    
    // Store interval ID to clear it later
    this.activeMonitoring.set(deviceId, { 
      ...this.activeMonitoring.get(deviceId),
      deviceId, 
      intervalId: interval as unknown as number
    });
  }

  /**
   * Get connected device by ID, throwing an exception if not found
   * @param deviceId Device identifier
   * @returns Anviz client instance
   */
  private getConnectedDevice(deviceId: string): AnvizEdgeWrapper {
    const anvizClient = this.connections.get(deviceId) as AnvizEdgeWrapper;
    if (!anvizClient) {
      throw new BiometricException(
        `Device ${deviceId} is not connected`,
        HttpStatus.NOT_FOUND
      );
    }
    return anvizClient;
  }

  /**
   * Get device information
   * @param deviceId Device identifier
   * @returns Device information
   */
  async getDeviceInfo(deviceId: string): Promise<Record<string, any>> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const deviceInfo = await anvizClient.getDeviceInfo();
      return {
        ...deviceInfo,
        deviceId,
        ipAddress: this.devices.get(deviceId)?.ipAddress,
        port: this.devices.get(deviceId)?.port
      };
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting device info: ${errorMessage}`);
      throw new BiometricException(`Failed to get device info: ${errorMessage}`);
    }
  }

  /**
   * Get device serial number
   * @param deviceId Device identifier
   * @returns Device serial number
   */
  async getSerialNumber(deviceId: string): Promise<string> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const deviceInfo = await anvizClient.getDeviceInfo();
      return deviceInfo.serialNumber || '';
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting serial number: ${errorMessage}`);
      throw new BiometricException(`Failed to get serial number: ${errorMessage}`);
    }
  }

  /**
   * Get firmware version
   * @param deviceId Device identifier
   * @returns Firmware version
   */
  async getFirmwareVersion(deviceId: string): Promise<string> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const deviceInfo = await anvizClient.getDeviceInfo();
      return deviceInfo.firmwareVersion || '';
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting firmware version: ${errorMessage}`);
      throw new BiometricException(`Failed to get firmware version: ${errorMessage}`);
    }
  }

  /**
   * Get device name/model
   * @param deviceId Device identifier
   * @returns Device name
   */
  async getDeviceName(deviceId: string): Promise<string> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const deviceInfo = await anvizClient.getDeviceInfo();
      return `Anviz-${deviceInfo.deviceModel}` || 'Anviz Device';
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting device name: ${errorMessage}`);
      throw new BiometricException(`Failed to get device name: ${errorMessage}`);
    }
  }

  /**
   * Get device time
   * @param deviceId Device identifier
   * @returns Current device time
   */
  async getTime(deviceId: string): Promise<Date> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const deviceTime = await anvizClient.getTime();
      return deviceTime;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting device time: ${errorMessage}`);
      throw new BiometricException(`Failed to get device time: ${errorMessage}`);
    }
  }

  /**
   * Set device time
   * @param deviceId Device identifier
   * @param time Date to set
   * @returns Success indicator
   */
  async setTime(deviceId: string, time: Date): Promise<boolean> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      return await anvizClient.setTime(time);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error setting device time: ${errorMessage}`);
      throw new BiometricException(`Failed to set device time: ${errorMessage}`);
    }
  }

  /**
   * Get attendance records from a device
   * @param deviceId Device identifier
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   * @returns Array of attendance records
   */
  async getAttendanceRecords(
    deviceId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<AttendanceRecord[]> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      const records = await anvizClient.getAttendanceRecords();
      
      // Convert to standardized format
      const standardizedRecords: AttendanceRecord[] = records.map(record => ({
        userId: record.userId,
        timestamp: record.timestamp,
        deviceId: deviceId,
        type: this.mapAttendanceTypeToNumber(record.attendanceType),
        verificationMode: this.mapVerificationMethodToNumber(record.verifyMethod)
      }));
      
      // Filter by date range if provided
      let filteredRecords = standardizedRecords;
      if (startDate || endDate) {
        filteredRecords = standardizedRecords.filter(record => {
          const recordTime = record.timestamp.getTime();
          const isAfterStart = startDate ? recordTime >= startDate.getTime() : true;
          const isBeforeEnd = endDate ? recordTime <= endDate.getTime() : true;
          return isAfterStart && isBeforeEnd;
        });
      }
      
      return filteredRecords;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting attendance records: ${errorMessage}`);
      throw new BiometricException(`Failed to get attendance records: ${errorMessage}`);
    }
  }

  /**
   * Get attendance log size
   * @param deviceId Device identifier
   * @returns Attendance log size
   */
  async getAttendanceSize(deviceId: string): Promise<number> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      const records = await anvizClient.getAttendanceRecords();
      return records.length;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting attendance size: ${errorMessage}`);
      throw new BiometricException(`Failed to get attendance size: ${errorMessage}`);
    }
  }

  /**
   * Get users from a device
   * @param deviceId Device identifier
   * @returns Array of user objects
   */
  async getUsers(deviceId: string): Promise<IBiometricUser[]> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      const employees = await anvizClient.getEmployees();
      
      return employees.map(employee => ({
        userId: employee.userId,
        name: employee.name || '',
        password: employee.password || '',
        cardNumber: employee.cardNumber || '',
        role: employee.privilege || 0
      }));
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error getting users: ${errorMessage}`);
      throw new BiometricException(`Failed to get users: ${errorMessage}`);
    }
  }

  /**
   * Delete a user from the device
   * @param deviceId Device identifier
   * @param userId User ID to delete
   * @returns True if deleted successfully
   */
  async deleteUser(deviceId: string, userId: string): Promise<boolean> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      const result = await anvizClient.deleteEmployee(userId);
      
      if (result) {
        // Also remove any saved templates
        await this.templateRepository.delete({
          userId: userId,
          provider: 'anviz'
        });
      }
      
      this.logger.log(`Successfully deleted user ${userId} from device ${deviceId}`);
      return result;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error deleting user ${userId}: ${errorMessage}`);
      throw new BiometricException(`Failed to delete user: ${errorMessage}`);
    }
  }

  /**
   * Enroll a user's fingerprint
   * @param deviceId Device identifier
   * @param userId User ID
   * @param fingerId Finger ID (0-9)
   * @returns Biometric template
   */
  async enrollUser(deviceId: string, userId: string, fingerId: number): Promise<IBiometricTemplate> {
    // This would typically require physical interaction with the device
    // For Anviz devices, enrollment is usually done on the device itself
    throw new BiometricException(
      'Remote fingerprint enrollment is not supported for Anviz devices. Please enroll fingerprints directly on the device.',
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  /**
   * Verify a fingerprint template
   * @param deviceId Device identifier
   * @param template Template to verify
   * @returns True if verified
   */
  async verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean> {
    // Verification would typically be done on the device
    throw new BiometricException(
      'Remote fingerprint verification is not supported for Anviz devices.',
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  /**
   * Clear all attendance records from a device
   * @param deviceId Device identifier
   * @returns True if cleared successfully
   */
  async clearAttendanceRecords(deviceId: string): Promise<boolean> {
    const anvizClient = this.getConnectedDevice(deviceId);
    
    try {
      return await anvizClient.clearAttendanceRecords();
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error clearing attendance records: ${errorMessage}`);
      throw new BiometricException(`Failed to clear attendance records: ${errorMessage}`);
    }
  }

  /**
   * Restart a device
   * @param deviceId Device identifier
   * @returns True if restart initiated successfully
   */
  async restartDevice(deviceId: string): Promise<boolean> {
    const anvizClient = this.getConnectedDevice(deviceId);

    try {
      return await anvizClient.reboot();
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error restarting device: ${errorMessage}`);
      throw new BiometricException(`Failed to restart device: ${errorMessage}`);
    }
  }

  /**
   * Set up real-time attendance log monitoring
   * @param deviceId Device identifier
   * @param callback Function to call when attendance logs are received
   * @returns Monitoring ID that can be used to stop monitoring
   */
  startRealTimeMonitoring(
    deviceId: string,
    callback: (record: AttendanceRecord) => void
  ): string {
    const anvizClient = this.getConnectedDevice(deviceId);
    const monitoringId = `monitoring-${deviceId}-${Date.now()}`;
  
    try {
      this.logger.log(`Registering custom callback for real-time monitoring on device ${deviceId}`);
      
      // Update or create monitoring info - ensure deviceId is provided as required
      this.activeMonitoring.set(deviceId, { 
        deviceId: deviceId,  // Make sure deviceId is explicitly set
        callback: callback   // Store the callback
      });
      
      // If monitoring isn't already active, set it up
      if (!this.isMonitoringActive(deviceId)) {
        this.setupDefaultRealTimeMonitoring(deviceId, anvizClient)
        .catch(err => {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logger.error(`Failed to set up monitoring for device ${deviceId}: ${errMsg}`);
        });
      }
      
      this.logger.log(`Real-time monitoring callback registered for device ${deviceId} with ID ${monitoringId}`);
      return monitoringId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error registering monitoring callback for device ${deviceId}: ${errorMessage}`);
      throw new BiometricException(`Failed to start real-time monitoring: ${errorMessage}`);
    }
  }

  /**
   * Stop real-time monitoring
   * @param monitoringId Monitoring ID returned from startRealTimeMonitoring
   * @returns True if stopped successfully
   */
  stopRealTimeMonitoring(monitoringId: string): boolean {
    // Extract device ID from monitoring ID
    const parts = monitoringId.split('-');
    if (parts.length < 2) {
      this.logger.warn(`Invalid monitoring ID: ${monitoringId}`);
      return false;
    }
    
    const deviceId = parts[1];
    const anvizClient = this.connections.get(deviceId) as AnvizEdgeWrapper;
    
    if (!anvizClient || !this.activeMonitoring.has(deviceId)) {
      this.logger.warn(`No active monitoring found for ID ${monitoringId}`);
      return false;
    }
    
    try {
      // Disable real-time monitoring on the device
      anvizClient.stopMonitoring();
      
      // Remove event listeners
      anvizClient.removeAllListeners('attendance');
      
      // Remove monitoring info
      this.activeMonitoring.delete(deviceId);
      
      this.logger.log(`Stopped real-time monitoring for device ${deviceId}`);
      return true;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error stopping real-time monitoring: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Execute a custom command on the device
   * This is a placeholder implementation as the real implementation would depend
   * on the specific commands supported by the Anviz device
   */
  async executeCommand(deviceId: string, command: string, data: string = ''): Promise<any> {
    throw new BiometricException(
      'Custom command execution is not supported for Anviz devices through this interface.',
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  /**
   * Unlock the device door
   * This is a placeholder implementation as the real implementation would depend
   * on the specific door unlock mechanism supported by the Anviz device
   */
  async unlockDoor(deviceId: string): Promise<boolean> {
    throw new BiometricException(
      'Door unlock operation is not supported for Anviz devices through this interface.',
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  /**
   * Sync users between two devices
   * @param sourceDeviceId Source device ID
   * @param targetDeviceId Target device ID
   * @returns Number of users synced
   */
  async syncUsers(sourceDeviceId: string, targetDeviceId: string): Promise<number> {
    try {
      // Get users from source device
      const sourceUsers = await this.getUsers(sourceDeviceId);
      
      if (!sourceUsers || sourceUsers.length === 0) {
        this.logger.warn(`No users found on source device ${sourceDeviceId}`);
        return 0;
      }
      
      this.logger.log(`Syncing ${sourceUsers.length} users from ${sourceDeviceId} to ${targetDeviceId}`);
      
      let syncCount = 0;
      
      // For each user
      for (const user of sourceUsers) {
        try {
          // Register user on target device
          await this.registerUser(targetDeviceId, {
            userId: user.userId,
            name: user.name,
            password: user.password,
            cardNumber: user.cardNumber,
            role: user.role
          });
          
          // Get all fingerprints for this user (max 10 fingers)
          for (let fingerId = 0; fingerId < 10; fingerId++) {
            const template = await this.getUserFingerprint(sourceDeviceId, user.userId, fingerId);
            
            if (template && template.template) {
              // If template exists for this finger, save it to the database for the target device
              const templateEntity = this.templateRepository.create({
                userId: user.userId,
                fingerId: fingerId,
                // Ensure template is properly converted to Buffer before saving
                template: Buffer.isBuffer(template.template) ? template.template : Buffer.from(template.template),
                provider: 'anviz'
              });
              
              await this.templateRepository.save(templateEntity);
            }
          }
          
          syncCount++;
        } catch (error) {
          const errorMessage = this.formatErrorMessage(error);
          this.logger.error(`Error syncing user ${user.userId}: ${errorMessage}`);
          // Continue with next user
        }
      }
      
      this.logger.log(`Successfully synced ${syncCount} users from ${sourceDeviceId} to ${targetDeviceId}`);
      return syncCount;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      this.logger.error(`Error syncing users: ${errorMessage}`);
      throw new BiometricException(`Failed to sync users: ${errorMessage}`);
    }
  }

  /**
   * Get user details (added for interface compatibility)
   */
  async getUserDetails(deviceId: string): Promise<IBiometricUser[]> {
    // Delegates to getUsers for Anviz
    return this.getUsers(deviceId);
  }

  /**
   * Set user (added for interface compatibility)
   */
  async setUser(
    deviceId: string,
    uid: number,
    userId: string,
    name: string,
    password?: string,
    role?: number,
    cardno?: number
  ): Promise<boolean> {
    return this.registerUser(deviceId, {
      userId,
      name,
      password,
      cardNumber: cardno?.toString(),
      role
    }).then(() => true).catch(() => false);
  }

  /**
   * Check if monitoring is active for a device
   * @param deviceId Device identifier
   * @returns True if monitoring is active
   */
  private isMonitoringActive(deviceId: string): boolean {
    const monitorInfo = this.activeMonitoring.get(deviceId);
    return !!monitorInfo;
  }

  /**
   * Format error message for consistent logging and responses
   * @param error Error object or string
   * @returns Formatted error message
   */
  protected formatErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}