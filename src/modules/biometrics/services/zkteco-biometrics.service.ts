import { HttpStatus, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

const ZKLib = require("zkteco-js");

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { BiometricDevice } from '../entities/biometric-device.entity';
import { BiometricTemplate } from '../entities/biometric-template.entity';
import { AttendanceRecord, IBiometricDevice, IBiometricTemplate, IBiometricUser } from '../interfaces/biometric.interface';
import { BaseBiometricsService, BiometricException } from './base-biometrics.service';
import { BiometricsPollingService } from './biometrics-polling.service';

/**
 * ZKTeco implementation of the biometric service
 * Handles communication with ZKTeco biometric devices
 */
@Injectable()
export class ZKTecoBiometricsService extends BaseBiometricsService implements OnModuleDestroy {
    protected readonly logger = new Logger(ZKTecoBiometricsService.name);
    
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
     * Register a new user on the ZKTeco device without fingerprint enrollment
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
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Registering user ${userData.userId} on device ${deviceId}`);
            
            // Convert userId to numeric ID if possible, or use a default
            const uid = parseInt(userData.userId) || Math.floor(Math.random() * 9000) + 1000;
            
            // Prepare parameters with defaults
            const name = userData.name || `User ${userData.userId}`;
            const password = userData.password || '';
            const role = userData.role || 0; // 0 = normal user, 14 = admin
            const cardno = userData.cardNumber ? parseInt(userData.cardNumber) : 0;
            
            // Validate input parameters
            if (uid <= 0 || uid > 65535) {
                throw new Error('User ID must be a positive integer less than 65535');
            }
            
            if (name.length > 24) {
                throw new Error('Name must be less than 24 characters');
            }
            
            if (password.length > 8) {
                throw new Error('Password must be less than 8 characters');
            }
            
            // Create/update the user on the device
            await zkDevice.setUser(uid, userData.userId, name, password, role, cardno);
            
            // Create a standardized user object to return
            const createdUser: IBiometricUser = {
                userId: userData.userId,
                name: name,
                password: password,
                cardNumber: cardno.toString(),
                role: role
            };
            
            this.logger.log(`Successfully registered user ${userData.userId} on device ${deviceId}`);
            return createdUser;
        } catch (error) {
            // log error object as json
            this.logger.error(`Error registering user on device ${deviceId}: ${JSON.stringify(error)}`);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error registering user on device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to register user: ${errorMessage}`, HttpStatus.BAD_REQUEST);
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
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Retrieving fingerprint template for user ${userId} (finger ${fingerId}) from device ${deviceId}`);

            // First check database for existing template
            try {
                const existingTemplate = await this.templateRepository.findOne({
                    where: {
                        userId,
                        fingerId,
                        provider: 'zkteco'
                    }
                });
                
                if (existingTemplate && existingTemplate.template) {
                    this.logger.log(`Found existing template in database for user ${userId} (finger ${fingerId})`);
                    return {
                        id: `${userId}-${fingerId}`,
                        userId,
                        fingerId,
                        template: existingTemplate.template,
                        provider: 'zkteco'
                    };
                }
            } catch (dbError) {
                this.logger.warn(`Database lookup failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
            }

            // Convert userId to numeric ID if it's a number
            const uid = parseInt(userId) || Number(userId);
            
            if (isNaN(uid)) {
                throw new Error(`Invalid user ID format: ${userId}`);
            }

            // Create data buffer for the command
            const cmdData = Buffer.alloc(8);
            cmdData.writeUInt32LE(uid, 0);      // User ID in little-endian format
            cmdData.writeUInt32LE(fingerId, 4); // Finger ID in little-endian format

            // Check if executeCmd is available
            if (typeof zkDevice.executeCmd !== 'function') {
                throw new Error('Device does not support the required commands');
            }

            // Clear any pending data
            try {
                await zkDevice.freeData();
            } catch (err) {
                this.logger.warn(`Could not free data buffer: ${err instanceof Error ? err.message : String(err)}`);
            }

            // Proper device state management
            await zkDevice.disableDevice();
            await zkDevice.enableDevice();
            
            // Add a small delay to ensure device is ready
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Execute the command to get the fingerprint template
            // CMD_USERTEMP_RRQ = 9 (0x0009)
            const result = await zkDevice.executeCmd('CMD_USERTEMP_RRQ', cmdData);
            
            // Log raw result for debugging
            this.logger.debug(`Raw result from device: length=${result?.length || 0}, first bytes: ${result ? result.slice(0, 20).toString('hex') : 'null'}`);

            // Check if we got a valid response
            if (!result || result.length < 12) {
                this.logger.warn(`No fingerprint template found for user ${userId} (finger ${fingerId})`);
                return null;
            }

            // Parse the result according to ZKTeco protocol
            const templateData = result.subarray(12);

            if (templateData.length === 0) {
                this.logger.warn(`Empty template data for user ${userId} (finger ${fingerId})`);
                return null;
            }

            this.logger.debug(`Retrieved fingerprint template for user ${userId} (finger ${fingerId}): ${templateData.length} bytes`);

            // Create a standardized template object
            const template: IBiometricTemplate = {
                id: `${userId}-${fingerId}`,
                userId,
                fingerId,
                template: templateData,
                provider: 'zkteco'
            };

            // Optionally save the template to database
            try {
                await this.templateRepository.save({
                    userId,
                    fingerId,
                    template: templateData,
                    provider: 'zkteco'
                });
                this.logger.debug(`Saved fingerprint template for user ${userId} (finger ${fingerId}) to database`);
            } catch (dbError) {
                this.logger.warn(`Could not save template to database: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
                // Continue even if database save fails
            }

            return template;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error retrieving fingerprint template from device ${deviceId}: ${errorMessage}`);
            
            // Check if it's a "template not exist" error, which should return null instead of throwing
            if (errorMessage.includes('not exist') || errorMessage.includes('No Record')) {
                this.logger.warn(`No fingerprint template exists for user ${userId} (finger ${fingerId})`);
                return null;
            }
            
            throw new BiometricException(`Failed to get fingerprint template: ${errorMessage}`);
        }
    }

    /**
     * Connect to a device with retry logic
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
        const timeout = this.configService.get<number>('ZKTECO_TIMEOUT', 5000);
        const retryAttempts = this.configService.get<number>('ZKTECO_RETRY_ATTEMPTS', 3);
        const retryDelay = this.configService.get<number>('ZKTECO_RETRY_DELAY', 1000);
        
        let attempts = 0;
        let lastError: Error = new Error('No connection attempts made');

        while (attempts < retryAttempts) {
            try {
                attempts++;
                this.logger.log(`Connecting to device ${deviceId} (attempt ${attempts}/${retryAttempts})`);
                
                // Create ZK instance with parameters, not options object
                // According to the example: new ZKLib(host, port, timeout, retry)
                const zk = new ZKLib(ipAddress, port, timeout, retryDelay);
                
                // Create socket connection first (as per example)
                await zk.createSocket();
                
                // Collect comprehensive device information
                let deviceInfo = await zk.getInfo();
                
                // Try to get additional device information
                try {
                    const serialNumber = await zk.getSerialNumber();
                    const firmware = await zk.getFirmware();
                    const platform = await zk.getPlatform();
                    const deviceName = await zk.getDeviceName();
                    const deviceVersion = await zk.getDeviceVersion();
                    const os = await zk.getOS();
                    
                    // Enhance device info with additional details
                    deviceInfo = {
                        ...deviceInfo,
                        serialNumber: serialNumber || deviceInfo?.serialNumber,
                        firmware: firmware || deviceInfo?.firmware,
                        platform: platform || deviceInfo?.platform,
                        deviceName: deviceName,
                        deviceVersion: deviceVersion,
                        os: os
                    };
                    
                } catch (infoError) {
                    this.logger.warn(`Could not retrieve comprehensive device info: ${infoError instanceof Error ? infoError.message : String(infoError)}`);
                }
                
                // Store connection
                this.connections.set(deviceId, zk);

                // Create device object with enhanced info
                const device: IBiometricDevice = {
                    id: deviceId,
                    ipAddress,
                    port,
                    model: deviceInfo?.deviceName || deviceInfo?.model || 'Unknown',
                    serialNumber: deviceInfo?.serialNumber || 'Unknown',
                    firmware: deviceInfo?.firmware,
                    platform: deviceInfo?.platform,
                    deviceVersion: deviceInfo?.deviceVersion,
                    os: deviceInfo?.os,
                    isConnected: true,
                };

                // Store device in memory
                this.devices.set(deviceId, device);
                
                // Store in database
                await this.deviceRepository.save({
                    id: deviceId,
                    ipAddress,
                    port,
                    model: device.model,
                    serialNumber: device.serialNumber,
                    provider: 'zkteco',
                    firmware: device.firmware,
                    platform: device.platform,
                    deviceVersion: device.deviceVersion,
                    os: device.os,
                    isConnected: true,
                });

                // Register the connection with the polling service
                this.biometricsPollingService.registerDeviceConnection(deviceId, zk);
                
                // Start polling instead of direct setup
                this.biometricsPollingService.startPolling(deviceId);
    
                
                this.logger.log(`Successfully connected to ZKTeco device at ${ipAddress}:${port}`);
                return device;
            } catch (error) {
                // Ensure error is properly typed
                this.logger.warn(`Connection attempt ${attempts} to device ${deviceId}`);
                
                // If we have retries left, wait before trying again
                if (attempts < retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }

        // If we get here, all connection attempts failed
        this.logger.error(`Failed to connect to ZKTeco device after ${attempts} attempts: ${lastError.message}`);
        throw new BiometricException(
            `Failed to connect to device: ${lastError.message}`, 
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    /**
     * Set up default real-time monitoring for a device
     * @param deviceId Device identifier 
     * @param zkDevice ZK device instance
     */
    private async setupDefaultRealTimeMonitoring(deviceId: string, zkDevice: any): Promise<void> {
        this.logger.log(`Setting up default real-time monitoring for device ${deviceId}`);
        
        // Before attempting to get real-time logs, ensure connection is active
        if (!zkDevice._socket || !zkDevice._socket.writable) {
            await zkDevice.createSocket();
            this.logger.debug(`Refreshed socket connection for device ${deviceId}`);
        }
        
        // Enable device first to ensure it's ready to receive commands
        await zkDevice.enableDevice();

        // Register for real-time logs
        zkDevice.getRealTimeLogs((record: any) => {
            if (!record) return;
            
            this.logger.debug(`Received real-time log: ${JSON.stringify(record)}`);
            
            // Convert to standard format
            const standardizedRecord: AttendanceRecord = {
                userId: record.userId || '',
                timestamp: new Date(record.timestamp || Date.now()),
                type: record.type ?? 0,
                deviceId: deviceId,
                verificationMode: record.verificationMode,
                status: record.status,
                workcode: record.workcode,
                isSynced: false,
                retrievedAt: new Date(),
                data: record.data
            };
            
            // Emit event for this record
            this.emitAttendanceEvent(standardizedRecord);
            
            // Call any custom callback if registered
            const monitorInfo = this.activeMonitoring.get(deviceId);
            if (monitorInfo && typeof monitorInfo.callback === 'function') {
                monitorInfo.callback(standardizedRecord);
            }
        });
        
        // Store in active monitoring with empty callback
        this.activeMonitoring.set(deviceId, { deviceId, callback: undefined });
        
        this.logger.log(`Default real-time monitoring established for device ${deviceId}`);
    }

    /**
     * Setup monitoring for device connection status
     * @param deviceId Device identifier
     * @param zkDevice ZK device instance
     */
    private setupDeviceMonitoring(deviceId: string, zkDevice: any): void {
        const pingInterval = this.configService.get<number>('DEVICE_PING_INTERVAL', 3000);
        
        const interval = setInterval(async () => {
            if (!this.connections.has(deviceId)) {
                clearInterval(interval);
                return;
            }
            
            try {
                // Try to get device info as a ping
                await zkDevice.getInfo();
                
                // If monitoring was set up but is no longer active, try to restart it
                if (this.activeMonitoring.has(deviceId) && !this.isMonitoringActive(deviceId)) {
                    this.logger.warn(`Real-time monitoring appears to have stopped for device ${deviceId}. Attempting to restart...`);
                    
                    try {
                        await this.setupDefaultRealTimeMonitoring(deviceId, zkDevice);
                        this.logger.log(`Successfully restarted real-time monitoring for device ${deviceId}`);
                    } catch (monitoringError) {
                        this.logger.error(`Failed to restart monitoring: ${monitoringError instanceof Error ? monitoringError.message : String(monitoringError)}`);
                    }
                }
            } catch (error) {
                // Your existing error handling code
            }
        }, pingInterval);
    }


    /**
     * Disconnect from a ZKTeco device
     * @param deviceId Device identifier
     * @returns True if disconnected successfully
     */
    async disconnect(deviceId: string): Promise<boolean> {
        // Stop the polling first
        this.biometricsPollingService.stopPolling(deviceId);
        const zkDevice = this.connections.get(deviceId);
        if (!zkDevice) {
            this.logger.warn(`Attempted to disconnect from device ${deviceId} but no connection found`);
            return false;
        }

        try {
            // Clear monitoring first
            this.activeMonitoring.delete(deviceId);
            
            // Use disconnect method
            await zkDevice.disconnect();
            this.connections.delete(deviceId);
        
            const device = this.devices.get(deviceId);
            if (device) {
                device.isConnected = false;
                this.devices.set(deviceId, device);
            }
            
            await this.deviceRepository.update(
                { id: deviceId },
                { isConnected: false }
            );
            
            this.logger.log(`Successfully disconnected from ZKTeco device ${deviceId}`);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error disconnecting from device ${deviceId}: ${errorMessage}`);
            return false;
        }
    }

    /**
     * Get connected device by ID, throwing an exception if not found
     * @param deviceId Device identifier
     * @returns ZK device instance
     */
    private getConnectedDevice(deviceId: string): any {
        const zkDevice = this.connections.get(deviceId);
        if (!zkDevice) {
            throw new BiometricException(
                `Device ${deviceId} not connected or not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return zkDevice;
    }

    /**
     * Get device information
     * @param deviceId Device identifier
     * @returns Device information
     */
    async getDeviceInfo(deviceId: string): Promise<Record<string, any>> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const info = await zkDevice.getInfo();
            this.logger.debug(`Retrieved device info for ${deviceId}: ${JSON.stringify(info)}`);
        return info;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device info from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get device info: ${errorMessage}`);
        }
    }

    /**
     * Get device serial number
     * @param deviceId Device identifier
     * @returns Device serial number
     */
    async getSerialNumber(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const serialNumber = await zkDevice.getSerialNumber();
            this.logger.debug(`Retrieved serial number for ${deviceId}: ${serialNumber}`);
            return serialNumber;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting serial number from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get serial number: ${errorMessage}`);
        }
    }

    /**
     * Get firmware version
     * @param deviceId Device identifier
     * @returns Firmware version
     */
    async getFirmwareVersion(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const firmware = await zkDevice.getFaceOn();
            this.logger.debug(`Retrieved firmware version for ${deviceId}: ${firmware}`);
            return firmware;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting firmware version from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get firmware version: ${errorMessage}`);
        }
    }

    /**
     * Get device platform
     * @param deviceId Device identifier
     * @returns Platform information
     */
    async getPlatform(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const platform = await zkDevice.getPlatform();
            this.logger.debug(`Retrieved platform info for ${deviceId}: ${platform}`);
            return platform;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting platform info from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get platform info: ${errorMessage}`);
        }
    }

    /**
     * Get device name
     * @param deviceId Device identifier
     * @returns Device name
     */
    async getDeviceName(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const name = await zkDevice.getDeviceName();
            this.logger.debug(`Retrieved device name for ${deviceId}: ${name}`);
            return name;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device name from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get device name: ${errorMessage}`);
        }
    }

    /**
     * Get device OS version
     * @param deviceId Device identifier
     * @returns OS version
     */
    async getOS(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const os = await zkDevice.getOS();
            this.logger.debug(`Retrieved OS info for ${deviceId}: ${os}`);
            return os;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting OS info from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get OS info: ${errorMessage}`);
        }
    }

    /**
     * Get device version
     * @param deviceId Device identifier
     * @returns Device version
     */
    async getDeviceVersion(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const version = await zkDevice.getDeviceVersion();
            this.logger.debug(`Retrieved device version for ${deviceId}: ${version}`);
            return version;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device version from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get device version: ${errorMessage}`);
        }
    }

    /**
     * Get device PIN
     * @param deviceId Device identifier
     * @returns Device PIN
     */
    async getPIN(deviceId: string): Promise<string> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const pin = await zkDevice.getPIN();
            this.logger.debug(`Retrieved PIN for ${deviceId}: ${pin}`);
            return pin;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting PIN from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get PIN: ${errorMessage}`);
        }
    }

    /**
     * Check if face recognition is enabled
     * @param deviceId Device identifier
     * @returns True if face recognition is enabled
     */
    async getFaceOn(deviceId: string): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const faceOn = await zkDevice.getFaceOn();
            this.logger.debug(`Retrieved face recognition status for ${deviceId}: ${faceOn}`);
            return faceOn;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting face recognition status from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get face recognition status: ${errorMessage}`);
        }
    }

    /**
     * Get Self-Service-Recorder status
     * @param deviceId Device identifier
     * @returns SSR status
     */
    async getSSR(deviceId: string): Promise<any> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const ssr = await zkDevice.getSSR();
            this.logger.debug(`Retrieved SSR status for ${deviceId}: ${JSON.stringify(ssr)}`);
            return ssr;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting SSR status from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get SSR status: ${errorMessage}`);
        }
    }

    /**
     * Get device time
     * @param deviceId Device identifier
     * @returns Current device time
     */
    async getTime(deviceId: string): Promise<Date> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const time = await zkDevice.getTime();
            this.logger.debug(`Retrieved time for ${deviceId}: ${time}`);
            return time;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting time from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get time: ${errorMessage}`);
        }
    }

    /**
     * Set device time
     * @param deviceId Device identifier
     * @param time Date to set
     * @returns Success indicator
     */
    async setTime(deviceId: string, time: Date): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            await zkDevice.setTime(time);
            this.logger.debug(`Set time for ${deviceId} to ${time}`);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error setting time for ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to set time: ${errorMessage}`);
        }
    }

    /**
     * Get work code from device
     * @param deviceId Device identifier
     * @returns Work code
     */
    async getWorkCode(deviceId: string): Promise<any> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const workCode = await zkDevice.getWorkCode();
            this.logger.debug(`Retrieved work code for ${deviceId}: ${workCode}`);
            return workCode;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting work code from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get work code: ${errorMessage}`);
        }
    }

    /**
     * Get attendance log size
     * @param deviceId Device identifier
     * @returns Attendance log size
     */
    async getAttendanceSize(deviceId: string): Promise<number> {
        const zkDevice = this.getConnectedDevice(deviceId);
        
        try {
            const size = await zkDevice.getAttendanceSize();
            this.logger.debug(`Retrieved attendance size for ${deviceId}: ${size}`);
            return size;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting attendance size from ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get attendance size: ${errorMessage}`);
        }
    }

    /**
     * Get users from a device
     * @param deviceId Device identifier
     * @returns Array of user IDs
     */
    async getUsers(deviceId: string): Promise<IBiometricUser[]> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Getting users from device ${deviceId}`);
            
            const response = await zkDevice.getUsers();
            
            // Extract the data array from the response object
            const users = response && response.data && Array.isArray(response.data) 
                ? response.data 
                : [];

            if (users.length === 0) {
                return [];
            }
            
            // Extract essential information for each user
            const userInfo = users.map((user: any) => ({
                userId: user.userId || user.id || '',
                name: user.name || '',
                password: user.password || '',
                role: user.role || 0,
                uid: user.uid || parseInt(user.userId) || 0,
                cardNumber: user.cardno?.toString() || ''
            })).filter((user: any) => user.userId && user.role <= 14);
            
            this.logger.log(`Found ${userInfo.length} users on device ${deviceId}`);
            return userInfo;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting users from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get users: ${errorMessage}`);
        }
    }

    /**
     * Delete a user from the device with specific ZKTeco protocol implementation
     * @param deviceId Device identifier
     * @param userId User ID to delete
     * @returns True if deleted successfully
     */
    async deleteUser(deviceId: string, userId: string): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Deleting user ${userId} from device ${deviceId}`);
            
            // Convert userId to numeric ID
            const uid = parseInt(userId);
            
            // Validate input parameter
            if (isNaN(uid) || uid <= 0 || uid > 65535) {
                throw new Error('Invalid user ID: must be a positive number less than 65535');
            }
            
            // Clear any pending data
            try {
                await zkDevice.freeData();
            } catch (err) {
                this.logger.warn(`Could not free data buffer: ${err instanceof Error ? err.message : String(err)}`);
            }
            
            if (typeof zkDevice.deleteUser === 'function') {
                const response = await zkDevice.deleteUser(uid);
                
                // Check the response for success
                const success = response && response.length > 0;
                
                // After successful deletion from device, also remove templates from database
                if (success) {
                    try {
                        const deleteResult = await this.templateRepository.delete({
                            userId: userId,
                            provider: 'zkteco'
                        });
                        
                        this.logger.debug(`Deleted ${deleteResult.affected || 0} templates from database for user ${userId}`);
                    } catch (dbError) {
                        this.logger.warn(`Failed to delete templates from database: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
                        // Continue even if database deletion fails
                    }
                }
                
                this.logger.log(`User ${userId} deletion ${success ? 'successful' : 'failed'}`);
                return success;
            } else {
                throw new Error('Device does not support direct user deletion through this library');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error deleting user ${userId} from device ${deviceId}: ${errorMessage}`);
            
            // If the user doesn't exist, consider it a success
            if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
                this.logger.warn(`User ${userId} not found on device ${deviceId}, considering deletion successful`);
                return true;
            }
            
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
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Enrolling fingerprint for user ${userId} (finger ${fingerId}) on device ${deviceId}`);
            
            // First create or ensure the user exists
            // Convert userId to numeric if possible, or use a default
            const uid = parseInt(userId) || 1;
            const name = `User ${userId}`;  // Default name if not provided
            
            // Create/update the user first
            await this.setUser(deviceId, uid, userId, name);
            
            // Start enrollment mode using executeCmd
            // According to ZKTeco protocol, CMD_STARTENROLL (61 or 0x3d) initiates enrollment
            const enrollData = Buffer.alloc(24);
            enrollData.writeUInt32LE(uid, 0);        // User ID
            enrollData.writeUInt32LE(fingerId, 4);   // Finger index (0-9)
            enrollData.writeUInt32LE(1, 8);          // Flag (1 = valid)

            this.logger.log(`Starting enrollment process for user ${userId} (finger ${fingerId})`);
            
            // Use executeCmd to start enrollment if available
            let templateData;
            if (typeof zkDevice.executeCmd === 'function') {
                const result = await zkDevice.executeCmd('CMD_STARTENROLL', enrollData);
                
                // This is where we would typically wait for the enrollment result
                // But since the library doesn't have a direct method for this,
                // we'll need to implement a custom approach
                
                // For now, we'll create a placeholder template
                // In a real implementation, you would need to:
                // 1. Prompt the user to place their finger on the device
                // 2. Wait for the device to capture the fingerprint
                // 3. Retrieve the template data from the device
                
                // Mock template data (should be replaced with actual implementation)
                templateData = Buffer.from(`template-${userId}-${fingerId}-${Date.now()}`);
                
                this.logger.warn(`Note: This is a placeholder implementation. The ZKTeco-js library doesn't directly support fingerprint enrollment. Please check the device manual for specific enrollment procedures.`);
            } else {
                throw new Error('Device does not support direct fingerprint enrollment through this library. Consider using the device\'s physical interface for enrollment.');
            }
            
            // Create a template object
            const template: IBiometricTemplate = {
                id: `${userId}-${fingerId}`,
                userId,
                fingerId,
                template: Buffer.isBuffer(templateData) ? templateData : Buffer.from(templateData),
                provider: 'zkteco'
            };
            
            // Save template to database
            await this.templateRepository.save({
                userId,
                fingerId,
                template: Buffer.isBuffer(template.template) 
                    ? template.template 
                    : Buffer.from(template.template.toString()),
                provider: 'zkteco'
            });
            
            this.logger.log(`Successfully enrolled fingerprint for user ${userId} (finger ${fingerId})`);
            return template;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error enrolling user on device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to enroll user: ${errorMessage}`);
        }
    }

    /**
     * Verify a fingerprint template
     * @param deviceId Device identifier
     * @param template Template to verify
     * @returns True if verified
     */
    async verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
        this.logger.log(`Verifying fingerprint for user ${template.userId} on device ${deviceId}`);
        
        // The method name depends on the library implementation
        let result;
        if (typeof zkDevice.verifyFingerprint === 'function') {
            result = await zkDevice.verifyFingerprint(template.userId, template.fingerId, template.template);
        } else if (typeof zkDevice.verify === 'function') {
            result = await zkDevice.verify(template.userId, template.fingerId, template.template);
        } else {
            throw new Error('Device does not support fingerprint verification');
        }
        
        this.logger.log(`Verification result for user ${template.userId}: ${result}`);
        return result === true;
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error verifying fingerprint on device ${deviceId}: ${errorMessage}`);
        throw new BiometricException(`Failed to verify fingerprint: ${errorMessage}`);
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
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
        this.logger.log(`Getting attendance records from device ${deviceId}`);
        
        // Use the getAttendances method
        const records = await zkDevice.getAttendances();
        
        if (!records || !Array.isArray(records)) {
            return [];
        }
        
        // Convert records to a standard format
        const standardizedRecords: AttendanceRecord[] = records.map(record => ({
            userId: record.userId || '',
            timestamp: new Date(record.timestamp),
            type: record.type ?? 0, // Required field with fallback
            deviceId: deviceId, // Required field - use the current device ID
            verificationMode: record.verificationMode,
            status: record.status,
            workcode: record.workcode,
            isSynced: false, // Default value for new records
            retrievedAt: new Date(), // Set current time as retrieval time
            data: record.data
        }));
        
        // Filter by date if provided
        let filteredRecords = standardizedRecords;
        if (startDate || endDate) {
            filteredRecords = standardizedRecords.filter(record => {
            if (startDate && record.timestamp < startDate) return false;
            if (endDate && record.timestamp > endDate) return false;
            return true;
            });
        }
        
        this.logger.log(`Found ${filteredRecords.length} attendance records on device ${deviceId}`);
        return filteredRecords;
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error getting attendance records from device ${deviceId}: ${errorMessage}`);
        throw new BiometricException(`Failed to get attendance records: ${errorMessage}`);
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
        const zkDevice = this.getConnectedDevice(deviceId);
        const monitoringId = `monitoring-${deviceId}-${Date.now()}`;
    
        try {
        this.logger.log(`Registering custom callback for real-time monitoring on device ${deviceId}`);
        
        // Update or create monitoring info
        this.activeMonitoring.set(deviceId, { 
            deviceId, 
            callback: callback  // Store the callback
        });
        
        // If monitoring isn't already active, set it up
        if (!this.isMonitoringActive(deviceId)) {
            this.setupDefaultRealTimeMonitoring(deviceId, zkDevice)
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
     * Check if monitoring is active for a device
     */
    private isMonitoringActive(deviceId: string): boolean {
        return this.activeMonitoring.has(deviceId);
    }

    /**
     * Stop real-time monitoring
     * @param monitoringId Monitoring ID returned from startRealTimeMonitoring
     * @returns True if stopped successfully
     */
    stopRealTimeMonitoring(monitoringId: string): boolean {
        // This would need to be implemented based on how the library handles stopping monitoring
        // This is a placeholder implementation
        this.logger.log(`Stopping real-time monitoring for ID ${monitoringId}`);
        
        // In a real implementation, you would:
        // 1. Look up the deviceId and monitoring info using the monitoringId
        // 2. Call the appropriate method to stop monitoring on the device
        // 3. Clean up any resources
        
        return true;
    }

    /**
     * Clear all attendance records from a device
     * @param deviceId Device identifier
     * @returns True if cleared successfully
     */
    async clearAttendanceRecords(deviceId: string): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
            this.logger.log(`Clearing attendance records from device ${deviceId}`);
            
            // Use the clearAttendanceLog method
            await zkDevice.clearAttendanceLog();
            
            this.logger.log(`Successfully cleared attendance records from device ${deviceId}`);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error clearing attendance records from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to clear attendance records: ${errorMessage}`);
        }
    }

    /**
     * Restart a device
     * @param deviceId Device identifier
     * @returns True if restart initiated successfully
     */
    async restartDevice(deviceId: string): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
        this.logger.log(`Restarting device ${deviceId}`);
        
        // The method name depends on the library implementation
        if (typeof zkDevice.restart === 'function') {
            await zkDevice.restart();
        } else if (typeof zkDevice.restartDevice === 'function') {
            await zkDevice.restartDevice();
        } else {
            throw new Error('Device does not support restart');
        }
        
        this.logger.log(`Successfully initiated restart for device ${deviceId}`);
        return true;
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error restarting device ${deviceId}: ${errorMessage}`);
        throw new BiometricException(`Failed to restart device: ${errorMessage}`);
        }
    }

    /**
     * Unlock the device door
     * @param deviceId Device identifier
     * @returns True if unlock command sent successfully
     */
    async unlockDoor(deviceId: string): Promise<boolean> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
        this.logger.log(`Unlocking door for device ${deviceId}`);
        
        // The method name depends on the library implementation
        if (typeof zkDevice.executeCmd === 'function') {
            // Execute the unlock command
            // Note: CMD.CMD_UNLOCK would need to be defined or imported
            await zkDevice.executeCmd('CMD_UNLOCK', '');
        } else if (typeof zkDevice.unlockDoor === 'function') {
            await zkDevice.unlockDoor();
        } else {
            throw new Error('Device does not support door unlock');
        }
        
        this.logger.log(`Successfully unlocked door for device ${deviceId}`);
        return true;
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error unlocking door for device ${deviceId}: ${errorMessage}`);
        throw new BiometricException(`Failed to unlock door: ${errorMessage}`);
        }
    }

    /**
     * Execute a custom command on the device
     * @param deviceId Device identifier
     * @param command Command to execute
     * @param data Optional data for the command
     * @returns Command result
     */
    async executeCommand(deviceId: string, command: string, data: string = ''): Promise<any> {
        const zkDevice = this.getConnectedDevice(deviceId);

        try {
        this.logger.log(`Executing command ${command} on device ${deviceId}`);
        
        if (typeof zkDevice.executeCmd !== 'function') {
            throw new Error('Device does not support custom commands');
        }
        
        const result = await zkDevice.executeCmd(command, data);
        
        this.logger.log(`Successfully executed command ${command} on device ${deviceId}`);
        return result;
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error executing command on device ${deviceId}: ${errorMessage}`);
        throw new BiometricException(`Failed to execute command: ${errorMessage}`);
        }
    }

    /**
     * Sync users between two devices
     * @param sourceDeviceId Source device ID
     * @param targetDeviceId Target device ID
     * @returns Number of users synced
     */
    async syncUsers(sourceDeviceId: string, targetDeviceId: string): Promise<number> {
        try {
            this.logger.log(`Syncing users from device ${sourceDeviceId} to ${targetDeviceId}`);
            
            // Get users from source device
            const users = await this.getUserDetails(sourceDeviceId);
            if (!users || users.length === 0) {
                this.logger.warn(`No users found on source device ${sourceDeviceId}`);
                return 0;
            }
            
            // Get target device
            const targetDevice = this.getConnectedDevice(targetDeviceId);
            
            // Transfer each user to target device
            let syncedCount = 0;
            for (const user of users) {
                try {
                await this.setUser(
                    targetDeviceId,
                    parseInt(user.userId) || 0, // Use numeric ID if possible
                    user.userId,
                    user.name,
                    user.password,
                    user.role,
                    parseInt(user.cardNumber || '0') || 0
                );
                syncedCount++;
                } catch (userError) {
                const errorMessage = userError instanceof Error ? userError.message : String(userError);
                this.logger.warn(`Failed to sync user ${user.userId}: ${errorMessage}`);
                }
            }
            
            this.logger.log(`Successfully synced ${syncedCount} users from ${sourceDeviceId} to ${targetDeviceId}`);
            return syncedCount;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error syncing users: ${errorMessage}`);
            throw new BiometricException(`Failed to sync users: ${errorMessage}`);
        }
    }
}