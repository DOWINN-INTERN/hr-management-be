import { BiometricDeviceType } from '@/common/enums/biometrics-device-type.enum';
import { PunchMethod } from '@/common/enums/punch-method.enum';
import { PunchType } from '@/common/enums/punch-type.enum';
import { ATTENDANCE_EVENTS, AttendanceRecordedEvent } from '@/common/events/attendance.event';
import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectDeviceDto } from '../dtos/connect-device.dto';
import { BiometricDevice } from '../entities/biometric-device.entity';
import { BiometricTemplate } from '../entities/biometric-template.entity';
import { AttendanceRecord, IBiometricTemplate, IBiometricUser } from '../interfaces/biometric.interface';
import { BaseBiometricsService, BiometricException } from './base-biometrics.service';

// Import the Anviz protocol library
const { Device, Record, RecordInformation, DeviceInfo1, DeviceInfo2 } = require('../../../../anviz-protocol');

@Injectable()
export class AnvizBiometricsService extends BaseBiometricsService {
    protected readonly logger = new Logger(AnvizBiometricsService.name);
    private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
    // Add to your class properties
    private reconnectionTimers: Map<string, NodeJS.Timeout> = new Map();
    private readonly MAX_RECONNECT_DELAY = 30000; // 1 minute maximum delay

    biometricDeviceType: BiometricDeviceType = BiometricDeviceType.ANVIZ;
    
    constructor(
        @InjectRepository(BiometricTemplate)
        protected readonly templateRepository: Repository<BiometricTemplate>,
        @InjectRepository(BiometricDevice)
        protected readonly deviceRepository: Repository<BiometricDevice>,
        protected readonly eventEmitter: EventEmitter2,
    ) {
        super(deviceRepository, eventEmitter);
    }

    /**
     * Connect to an Anviz device with robust retry logic
     * @param deviceId Unique identifier for the device
     * @param ipAddress Device IP address
     * @param port Device port (default: 5010)
     * @param maxAttempts Maximum connection attempts (default: 3)
     * @returns Connected device information
     */
    async connectWithRetry(
        dto: ConnectDeviceDto,
        deviceId: string
    ): Promise<BiometricDevice> {
        let maxAttempts: number = 3;

        const { ipAddress, port } = dto;

        // Cancel any previous reconnection attempts for this device
        if (this.reconnectionTimers.has(deviceId)) {
            clearTimeout(this.reconnectionTimers.get(deviceId));
            this.reconnectionTimers.delete(deviceId);
        }
        // Check if already connected
        if (this.connections.has(deviceId)) {
            this.logger.warn(`Device ${deviceId} is already connected. Disconnecting first...`);
            await this.disconnect(deviceId, true);
        }
        
        let attemptCount = 0;
        
        // Try to connect with retry logic
        while (attemptCount < maxAttempts) {
            attemptCount++;
            this.logger.log(`Connection attempt ${attemptCount}/${maxAttempts} to Anviz device at ${ipAddress}:${port}`);
            
            try {

                // Create a new Anviz device connection
                const anvizDevice = new Device(ipAddress, port);
                
                // Set up connection events with proper reconnection handling
                anvizDevice.listener = {
                    onConnected: () => {
                        this.logger.log(`Successfully connected to Anviz device ${deviceId} at ${ipAddress}:${port}`);
                    },
                    onDisconnected: () => {
                        if (anvizDevice._heartbeatInterval) {
                            clearInterval(anvizDevice._heartbeatInterval);
                            anvizDevice._heartbeatInterval = null;
                        }
                    },
                    onConnectionLost: async () => {
                        this.logger.warn(`Connection lost to Anviz device ${deviceId}`);
                        
                        // Clear any heartbeat interval
                        if (anvizDevice._heartbeatInterval) {
                            clearInterval(anvizDevice._heartbeatInterval);
                            anvizDevice._heartbeatInterval = null;
                        }
                        
                        // Update device status to disconnected but not offline
                        await this.updateDeviceStatus(deviceId, false, false);
                        
                        // Schedule automatic reconnection
                        this.scheduleReconnect(deviceId);
                    },
                    onError: async (error: any) => {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        this.logger.error(`Anviz device ${deviceId} error: ${errorMessage}`);
                        
                        // For serious errors, update status and attempt reconnection
                        if (errorMessage.includes("timeout") || 
                            errorMessage.includes("network") ||
                            errorMessage.includes("connection")) {
                            
                            // Update device status to offline
                            await this.updateDeviceStatus(deviceId, false, true);
                            
                            // Schedule reconnection attempt
                            this.scheduleReconnect(deviceId);
                        }
                    },
                    onRecord: (record: any) => {
                        // Validate and standardize the record
                        if (!record || typeof record.userId === 'undefined' || !record.dateTime) {
                            this.logger.warn(`Received invalid record from device ${deviceId}`);
                            return;
                        }
                        
                        const standardizedRecord: AttendanceRecord = {
                            userId: record.userId.toString(),
                            timestamp: new Date(record.dateTime),
                            punchType: record.backupCode as PunchType,
                            punchMethod: this.getPunchMethod(record.type),
                            deviceId: deviceId,
                        };
                        
                        // Emit the attendance event
                        this.eventEmitter.emit(
                            ATTENDANCE_EVENTS.ATTENDANCE_RECORDED,
                            new AttendanceRecordedEvent([standardizedRecord], deviceId)
                        );
                    }
                };
                
                anvizDevice.connect();

                // Connection successful - configure device
                anvizDevice.getDeviceInfo2((info: any) => {
                    info.realTimeModeSetting = 1; // enable real time mode
                    info.relayMode = 3; // 0 control lock, 1 scheduled bell, 3 disabled
                    info.lockDelay = 2; // 2 seconds
                    anvizDevice.setDeviceInfo2(info);
                    
                    // Fetch and process any pending records
                    anvizDevice.getNewRecords((records: any) => {
                        if (records && records.length > 0) {
                            for (let i = 0; i < records.length; ++i) {
                                anvizDevice.listener.onRecord(records[i]);
                            }
                            anvizDevice.clearAllRecordsSign();
                        }
                    });
                });
                
                // Store the connection
                this.connections.set(deviceId, anvizDevice);
                
                // Fetch device information
                const deviceInfo = await this.getAnvizDeviceInfo(deviceId);

                // check if device Id alreayd exist
                const existingDevice = await this.deviceRepository.findOne({ where: { deviceId } });
                
                // Create a standardized device object
                let device: Partial<BiometricDevice> = {
                    id: existingDevice?.id,
                    deviceId,
                    ipAddress,
                    port,
                    serialNumber: deviceInfo.serialNumber || 'Unknown',
                    firmware: deviceInfo.firmwareVersion || 'Unknown',
                    isConnected: true,
                    isOffline: false,
                    provider: BiometricDeviceType.ANVIZ,
                    lastSync: new Date(),
                };
                
                // Update or create device in database
                return await this.deviceRepository.save(device);
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Connection attempt ${attemptCount} failed: ${errorMessage}`);
                
                // If we've reached max attempts, update device status and throw error
                if (attemptCount >= maxAttempts) {
                    // Update device as offline in database
                    throw new BiometricException(
                        `Failed to connect to device after ${maxAttempts} attempts: ${errorMessage}`, 
                        HttpStatus.BAD_REQUEST
                    );
                }
                
                // Wait before next attempt
                this.logger.log(`Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // This should not be reached due to the throw above
        throw new BiometricException('Failed to connect: Maximum retry attempts reached', HttpStatus.BAD_REQUEST);
    }

    /**
     * Schedule a reconnection attempt with exponential backoff
     * @param deviceId Device identifier
     * @param attempt Current attempt number (default: 0)
     */
    private scheduleReconnect(deviceId: string, attempt: number = 0): void {
        // Clear any existing reconnection timer
        if (this.reconnectionTimers.has(deviceId)) {
            clearTimeout(this.reconnectionTimers.get(deviceId));
        }
        
        const initialReconnectDelay = 5000; // 5 seconds
        
        // Calculate delay with exponential backoff but cap maximum delay
        const delay = Math.min(
            this.MAX_RECONNECT_DELAY,
            initialReconnectDelay * Math.pow(1.5, attempt)
        );
        
        this.logger.log(`Scheduling reconnection to device ${deviceId} in ${Math.round(delay/1000)} seconds (attempt #${attempt + 1})`);
        
        // Create new timer
        const timer = setTimeout(async () => {
            try {
                // Check if device still exists in our system
                if (!this.connections.has(deviceId)) {
                    // Device was removed entirely, stop reconnecting
                    this.reconnectionTimers.delete(deviceId);
                    return;
                }
                
                // Check if device is already connected
                const device = this.connections.get(deviceId);
                if (device && device.isConnected && device.isConnected()) {
                    // Already connected
                    this.reconnectionTimers.delete(deviceId);
                    return;
                }
                
                this.logger.log(`Attempting to reconnect to device ${deviceId} (attempt #${attempt + 1})`);
                
                // Attempt reconnection
                const deviceInfo = await this.deviceRepository.findOne({ where: { deviceId } });
                if (deviceInfo) {
                    try {
                        await this.connectWithRetry({ipAddress: deviceInfo.ipAddress, port: deviceInfo.port } as ConnectDeviceDto, deviceId);
                        this.logger.log(`Successfully reconnected to device ${deviceId}`);
                        this.reconnectionTimers.delete(deviceId);
                    } catch (reconnectError) {
                        // Reconnection failed, schedule next attempt
                        this.scheduleReconnect(deviceId, attempt + 1);
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to reconnect to device ${deviceId}: ${errorMessage}`);
                
                // Schedule next reconnection attempt
                this.scheduleReconnect(deviceId, attempt + 1);
            }
        }, delay);
        
        this.reconnectionTimers.set(deviceId, timer);
    }

    /**
     * Verify device connection is still active and responsive
     * @param device Anviz device instance
     * @param deviceId Device identifier
     */
    private verifyDeviceConnection(device: any, deviceId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Device ${deviceId} connection verification timeout`));
            }, 5000);
            
            try {
                device.getSerialNumber((serialNumber: any) => {
                    clearTimeout(timeoutId);
                    resolve();
                });
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from an Anviz device
     * @param deviceId Device identifier
     * @param isManual Whether this is a manual disconnect (if false, may trigger reconnection)
     * @returns True if disconnected successfully
     */
    async disconnect(deviceId: string, isManual: boolean = true): Promise<BiometricDevice> {
        // If this is a manual disconnect, clear any pending reconnection attempts
        if (isManual && this.reconnectionTimers.has(deviceId)) {
            clearTimeout(this.reconnectionTimers.get(deviceId));
            this.reconnectionTimers.delete(deviceId);
        }
        
        const anvizDevice = this.connections.get(deviceId);
        if (!anvizDevice) {
            throw new BadRequestException(`Device ${deviceId} is not connected`);
        }
        
        // Clear heartbeat interval
        if (anvizDevice._heartbeatInterval) {
            clearInterval(anvizDevice._heartbeatInterval);
            anvizDevice._heartbeatInterval = null;
        }
        
        anvizDevice.disconnect();
        this.connections.delete(deviceId);
        
        // Update device status
        let device = await this.updateDeviceStatus(deviceId, false, isManual ? false : true);
        
        // If this was not a manual disconnect and reconnection is desired, schedule reconnect
        if (!isManual) {
            this.scheduleReconnect(deviceId);
        }

        this.logger.log(`Disconnected from Anviz device ${deviceId}`);
        
        return device;
    }

    getPunchMethod(value: number): PunchMethod {
        switch (value) {
            case 0:
                return PunchMethod.FINGERPRINT;
            case 1:
                return PunchMethod.RFID;
            case 2:
                return PunchMethod.PASSWORD;
            default:
                return PunchMethod.UNKNOWN;
        }
    }

    /**
     * Get device information from Anviz device
     * @param deviceId Device identifier
     */
    private   getAnvizDeviceInfo(deviceId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const anvizDevice = this.getAnvizDevice(deviceId);
            
            // Get device information (DeviceInfo1 and DeviceInfo2)
            anvizDevice.getDeviceInfo1((deviceInfo1: any) => {
                anvizDevice.getDeviceInfo2((deviceInfo2: any) => {
                    // Get serial number
                    anvizDevice.getSerialNumber((serialNumber: any) => {
                        const info = {
                            serialNumber,
                            firmwareVersion: deviceInfo1.firmwareVersion,
                            deviceType: 'Anviz',
                            attendanceState: deviceInfo1.attendanceState,
                            language: deviceInfo1.language,
                            timeFormat: deviceInfo1.timeFormat,
                            dateFormat: deviceInfo1.dateFormat,
                            fingerprintPrecision: deviceInfo2.fingerprintPrecision,
                            workCodePermission: deviceInfo2.workCodePermission
                        };
                        resolve(info);
                    });
                });
            });
        });
    }

    /**
     * Get device information
     * @param deviceId Device identifier
     */
    async getDeviceInfo(deviceId: string): Promise<Record<string, any>> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Getting device info for ${deviceId}`);
            const info = await this.getAnvizDeviceInfo(deviceId);
            
            // Update device in database with latest information
            await this.deviceRepository.update(
                { id: deviceId },
                { 
                    serialNumber: info.serialNumber,
                    firmware: info.firmwareVersion,
                    lastSync: new Date()
                }
            );
            
            return info;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device info for ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get device info: ${errorMessage}`);
        }
    }

    /**
     * Get device time
     * @param deviceId Device identifier
     */
    async getTime(deviceId: string): Promise<Date> {
        try {
            this.checkDeviceConnection(deviceId);
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                anvizDevice.getDateTime((date: any) => {
                    resolve(date);
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device time: ${errorMessage}`);
            throw new BiometricException(`Failed to get device time: ${errorMessage}`);
        }
    }

    /**
     * Set device time
     * @param deviceId Device identifier
     * @param time Date to set
     */
    async setTime(deviceId: string, time: Date): Promise<boolean> {
        try {
            this.checkDeviceConnection(deviceId);
            
            const anvizDevice = this.getAnvizDevice(deviceId);
            anvizDevice.setDateTime(time);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error setting device time: ${errorMessage}`);
            throw new BiometricException(`Failed to set device time: ${errorMessage}`);
        }
    }

    /**
     * Get users from Anviz device
     * @param deviceId Device identifier
     */
    async getUsers(deviceId: string): Promise<IBiometricUser[]> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Getting users from device ${deviceId}`);
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                anvizDevice.getUserInfos((userInfos: any) => {
                    try {
                        // Convert Anviz user format to system format
                        const users: IBiometricUser[] = userInfos.map((user: any) => ({
                            userId: user.userId.toString(),
                            name: user.name || '',
                            password: user.password?.toString() || '',
                            cardNumber: user.card?.toString() || '',
                            role: user.group || 0,
                            enrolledFingerprints: []
                        }));
                        resolve(users);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting users from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get users: ${errorMessage}`);
        }
    }

    /**
     * Get fingerprint template for a user
     * @param deviceId Device identifier
     * @param userId User ID
     * @param fingerId Finger ID (default: 1 for Anviz devices)
     */
    async getUserFingerprint(
        deviceId: string,
        userId: string,
        fingerId: number = 1
    ): Promise<IBiometricTemplate | null> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Getting fingerprint for user ${userId} (finger ${fingerId}) from device ${deviceId}`);
            
            // First check database for cached template
            try {
                const existingTemplate = await this.templateRepository.findOne({
                    where: {
                        userId,
                        fingerId,
                        provider: 'anviz'
                    }
                });
                
                if (existingTemplate && existingTemplate.template) {
                    this.logger.log(`Found existing template in database for user ${userId} (finger ${fingerId})`);
                    return {
                        id: `${userId}-${fingerId}`,
                        userId,
                        fingerId,
                        template: existingTemplate.template,
                        provider: 'anviz'
                    };
                }
            } catch (dbError) {
                this.logger.warn(`Database lookup failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
            }
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                anvizDevice.getFpTemplate(parseInt(userId), fingerId, (templateData: any) => {
                    try {
                        if (!templateData || templateData.length === 0) {
                            resolve(null);
                            return;
                        }
                        
                        // Create template object
                        const template: IBiometricTemplate = {
                            id: `${userId}-${fingerId}`,
                            userId,
                            fingerId,
                            template: Buffer.from(templateData),
                            provider: 'anviz'
                        };
                        
                        // Cache template in database
                        this.templateRepository.save({
                            userId,
                            fingerId,
                            template: Buffer.isBuffer(template.template) ? template.template : Buffer.from(template.template),
                            provider: 'anviz'
                        }).catch(err => {
                            this.logger.warn(`Failed to cache template in database: ${err.message}`);
                        });
                        
                        resolve(template);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting fingerprint from device ${deviceId}: ${errorMessage}`);
            
            if (errorMessage.includes('not found') || errorMessage.includes('No Record')) {
                return null;
            }
            
            throw new BiometricException(`Failed to get fingerprint: ${errorMessage}`);
        }
    }

    /**
     * Register a new user on Anviz device
     * @param deviceId Device identifier
     * @param userData User data
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
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Registering user ${userData.userId} on device ${deviceId}`);
            
            const anvizDevice = this.getAnvizDevice(deviceId);
            
            // Create Anviz user object
            const userInfo = {
                userId: parseInt(userData.userId),
                name: userData.name,
                password: userData.password ? parseInt(userData.password) : 0,
                passwordLength: userData.password ? userData.password.length : 0,
                card: userData.cardNumber ? parseInt(userData.cardNumber) : 0,
                group: userData.role || 0,
                dpt: 1, // Department (default: 1)
                attendanceMode: 0 // Default mode
            };
            
            // Set user on device
            await new Promise<void>((resolve, reject) => {
                try {
                    anvizDevice.setUserInfo(userInfo);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            
            // Return standardized user object
            return {
                userId: userData.userId,
                name: userData.name,
                password: userData.password || '', // Provide a default empty string if password is undefined
                cardNumber: userData.cardNumber,
                role: userData.role || 0
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error registering user on device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to register user: ${errorMessage}`);
        }
    }

    /**
     * Delete a user from Anviz device
     * @param deviceId Device identifier
     * @param userId User ID to delete
     */
    async deleteUser(deviceId: string, userId: string): Promise<boolean> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Deleting user ${userId} from device ${deviceId}`);
            
            const anvizDevice = this.getAnvizDevice(deviceId);
            
            // Delete user
            anvizDevice.deleteUser(parseInt(userId));
            
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error deleting user ${userId} from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to delete user: ${errorMessage}`);
        }
    }

    /**
     * Get attendance records from Anviz device
     * @param deviceId Device identifier
     * @param startDate Start date for filtering (optional)
     * @param endDate End date for filtering (optional)
     */
    async getAttendanceRecords(
        deviceId: string, 
        startDate?: Date, 
        endDate?: Date
    ): Promise<AttendanceRecord[]> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Getting attendance records from device ${deviceId}`);
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                // Get all records
                anvizDevice.getAllRecords((records: any) => {
                    try {
                        // Convert Anviz records to system format
                        let attendanceRecords: AttendanceRecord[] = records.map((record: any) => {
                            const timestamp = new Date(record.dateTime);
                            
                            // Filter by date if provided
                            if ((startDate && timestamp < startDate) || 
                                (endDate && timestamp > endDate)) {
                                return null;
                            }
                            
                            return {
                                userId: record.userId.toString(),
                                timestamp: timestamp,
                                type: record.type || 0,
                                deviceId: deviceId,
                                status: record.workTypes ? record.workTypes[0] : 0
                            };
                        });
                        
                        // Filter out null records (those outside date range)
                        attendanceRecords = attendanceRecords.filter(record => record !== null);
                        
                        resolve(attendanceRecords);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting attendance records from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get attendance records: ${errorMessage}`);
        }
    }

    /**
     * Get attendance records size
     * @param deviceId Device identifier
     */
    async getAttendanceSize(deviceId: string): Promise<number> {
        try {
            this.checkDeviceConnection(deviceId);
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                anvizDevice.getRecordInformation((info: any) => {
                    try {
                        resolve(info.allRecordAmount || 0);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting attendance size from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to get attendance size: ${errorMessage}`);
        }
    }

    /**
     * Clear attendance records from device
     * @param deviceId Device identifier
     */
    async clearAttendanceRecords(deviceId: string): Promise<boolean> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Clearing attendance records from device ${deviceId}`);
            
            return new Promise((resolve, reject) => {
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                anvizDevice.clearAllRecords((result: any) => {
                    try {
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error clearing attendance records from device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to clear attendance records: ${errorMessage}`);
        }
    }

    /**
     * Unlock door of Anviz device
     * @param deviceId Device identifier
     */
    async unlockDoor(deviceId: string): Promise<boolean> {
        try {
            this.checkDeviceConnection(deviceId);
            
            this.logger.log(`Unlocking door for device ${deviceId}`);
            
            const anvizDevice = this.getAnvizDevice(deviceId);
            anvizDevice.openLock();
            
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error unlocking door for device ${deviceId}: ${errorMessage}`);
            throw new BiometricException(`Failed to unlock door: ${errorMessage}`);
        }
    }

    /**
     * Get the Anviz device connection, throwing an exception if not connected
     * @param deviceId Device identifier
     */
    private getAnvizDevice(deviceId: string): any {
        const anvizDevice = this.connections.get(deviceId);
        if (!anvizDevice) {
            throw new BiometricException(
                `Device ${deviceId} not connected`,
                HttpStatus.NOT_FOUND
            );
        }
        return anvizDevice;
    }

    /**
     * Check if device is connected
     * @param deviceId Device identifier
     */
    private checkDeviceConnection(deviceId: string): void {
        if (!this.connections.has(deviceId)) {
            throw new BiometricException(
                `Device ${deviceId} not connected`,
                HttpStatus.NOT_FOUND
            );
        }
    }
}