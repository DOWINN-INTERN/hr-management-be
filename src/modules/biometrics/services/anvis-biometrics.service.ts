import { BiometricDeviceType } from '@/common/enums/biometrics-device-type.enum';
import { PunchMethod } from '@/common/enums/punch-method.enum';
import { PunchType } from '@/common/enums/punch-type.enum';
import { ATTENDANCE_EVENTS, AttendanceRecordedEvent } from '@/common/events/attendance.event';
import { HttpStatus, Injectable, InternalServerErrorException, Logger, RequestTimeoutException } from '@nestjs/common';
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

/**
 * Interface for command queue items
 */
interface CommandQueueItem {
    id: string;
    operation: string;
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timestamp: number;
    timeout?: NodeJS.Timeout;
}

@Injectable()
export class AnvizBiometricsService extends BaseBiometricsService {
    protected readonly logger = new Logger(AnvizBiometricsService.name);
    biometricDeviceType: BiometricDeviceType = BiometricDeviceType.ANVIZ;
    
    // Command queue to avoid multiple operations on the same device simultaneously
    private commandQueues: Map<string, CommandQueueItem[]> = new Map();
    // Flag to track if a device's queue is being processed
    private processingQueues: Map<string, boolean> = new Map();
    // Default command timeout (15 seconds)
    private readonly commandTimeout = 15000;
    
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
     * Queue a command to be executed on a device
     * @param deviceId Device identifier
     * @param operation Operation name for logging
     * @param execute Function to execute
     * @returns Promise that resolves when the operation completes
     */
    private queueCommand<T>(deviceId: string, operation: string, execute: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Create queue for device if it doesn't exist
            if (!this.commandQueues.has(deviceId)) {
                this.commandQueues.set(deviceId, []);
                this.processingQueues.set(deviceId, false);
            }

            // Create a unique ID for this command
            const commandId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create command queue item
            const queueItem: CommandQueueItem = {
                id: commandId,
                operation,
                execute,
                resolve,
                reject,
                timestamp: Date.now(),
                timeout: setTimeout(() => {
                    // Remove item from queue if it times out
                    this.removeFromQueue(deviceId, commandId);
                    reject(new Error(`Operation '${operation}' timed out after ${this.commandTimeout}ms`));
                }, this.commandTimeout)
            };
            
            // Add item to device queue
            const queue = this.commandQueues.get(deviceId)!; // Non-null assertion as we create it above if it doesn't exist
            queue.push(queueItem);
            
            this.logger.debug(`Queued operation '${operation}' for device ${deviceId}. Queue length: ${queue.length}`);
            
            // Start processing queue if not already processing
            if (!this.processingQueues.get(deviceId)) {
                this.processQueue(deviceId);
            }
        });
    }
    
    /**
     * Process the command queue for a device
     * @param deviceId Device identifier
     */
    private async processQueue(deviceId: string): Promise<void> {
        if (!this.commandQueues.has(deviceId)) return;
        
        // Set processing flag
        this.processingQueues.set(deviceId, true);
        
        const queue = this.commandQueues.get(deviceId)!; // Non-null assertion as we already checked above
        
        // Process queue items one by one
        while (queue.length > 0) {
            const item = queue[0];
            
            this.logger.debug(`Executing operation '${item.operation}' for device ${deviceId}`);
            
            try {
                // Execute the command
                const result = await item.execute();
                // Clear timeout and resolve promise
                if (item.timeout) clearTimeout(item.timeout);
                item.resolve(result);
            } catch (error) {
                // Clear timeout and reject promise
                if (item.timeout) clearTimeout(item.timeout);
                item.reject(error);
            } finally {
                // Remove item from queue
                queue.shift();
            }
        }
        
        // Clear processing flag
        this.processingQueues.set(deviceId, false);
    }
    
    /**
     * Remove an item from the command queue
     * @param deviceId Device identifier
     * @param commandId Command ID to remove
     */
    private removeFromQueue(deviceId: string, commandId: string): boolean {
        if (!this.commandQueues.has(deviceId)) return false;
        
        const queue = this.commandQueues.get(deviceId)!; // Non-null assertion as we already checked above
        const initialLength = queue.length;
        
        // Filter out item with matching ID
        const newQueue = queue.filter(item => item.id !== commandId);
        this.commandQueues.set(deviceId, newQueue);
        
        return newQueue.length !== initialLength;
    }

    // Helper method to execute a promise with timeout
    private async executeWithTimeout<T>(
        promiseFn: () => Promise<T>, 
        timeoutMs: number, 
        timeoutMessage: string
    ): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            // Create timeout that rejects the promise
            const timeoutId = setTimeout(() => {
                reject(new RequestTimeoutException(timeoutMessage));
            }, timeoutMs);
            
            try {
                // Execute the actual promise
                const result = await promiseFn();
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Connect to an Anviz device with robust retry logic
     * @param dto Connection details
     * @param deviceId Device identifier
     * @returns Connected device information
     */
    async connectWithRetry(
        dto: ConnectDeviceDto,
        deviceId: string
    ): Promise<BiometricDevice> {
        const { ipAddress, port } = dto;

        // Check if already connected
        if (this.connections.has(deviceId)) {
            this.logger.warn(`Device ${deviceId} is already connected. Disconnecting first...`);
            await this.disconnect(deviceId);
        }
        
        try {
            // Create a connection promise with timeout
            const connectionPromise = async () => {
                // Create a new Anviz device connection
                const anvizDevice = new Device(ipAddress, port);
                
                // Set up connection events with proper reconnection handling
                anvizDevice.listener = {
                    onConnectionLost: async () => {
                        this.logger.warn(`Connection lost to Anviz device ${deviceId}`);
                        
                        // Clear any heartbeat interval
                        if (anvizDevice._heartbeatInterval) {
                            clearInterval(anvizDevice._heartbeatInterval);
                            anvizDevice._heartbeatInterval = null;
                        }
                        
                        await this.disconnect(deviceId);
                        
                        // Schedule automatic reconnection
                        this.scheduleReconnect(deviceId);
                    },
                    onError: async (error: any) => {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        this.logger.error(`Anviz device ${deviceId} error: ${errorMessage}`);
                        // Clear any heartbeat interval
                        if (anvizDevice._heartbeatInterval) {
                            clearInterval(anvizDevice._heartbeatInterval);
                            anvizDevice._heartbeatInterval = null;
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
                            // used the system date instead of the device date because time is not accurate and consistent
                            timestamp: new Date(),
                            punchType: record.type as PunchType,
                            punchMethod: this.getPunchMethod(record.backupCode),
                            deviceId: deviceId,
                        };

                        this.logger.log(`Received attendance record from device ${deviceId}: ${JSON.stringify(standardizedRecord)}`);
                        // Emit the attendance event
                        this.eventEmitter.emit(
                            ATTENDANCE_EVENTS.ATTENDANCE_RECORDED,
                            new AttendanceRecordedEvent([standardizedRecord], deviceId)
                        );
                        anvizDevice.clearAllRecords();
                    }
                };
                
                anvizDevice.connect();

                // Connection successful - configure device
                await new Promise<void>((resolve, reject) => {
                    anvizDevice.getDeviceInfo2((info: any) => {
                        try {
                            info.realTimeModeSetting = 1; // enable real time mode
                            info.relayMode = 3; // 0 control lock, 1 scheduled bell, 3 disabled
                            info.lockDelay = 2; // 2 seconds
                            anvizDevice.setDeviceInfo2(info);
                            
                            // Fetch and process any pending records
                            anvizDevice.getNewRecords((records: any) => {
                                try {
                                    if (records && records.length > 0) {
                                        for (let i = 0; i < records.length; ++i) {
                                            anvizDevice.listener.onRecord(records[i]);
                                        }
                                        anvizDevice.clearAllRecordsSign();
                                    }
                                    resolve();
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        } catch (err) {
                            reject(err);
                        }
                    });
                });
                
                // Store the connection
                this.connections.set(deviceId, anvizDevice);
                
                // Fetch device information
                const deviceInfo = await this.getAnvizDeviceInfo(deviceId);
                
                // Check if device ID already exists
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

                // Set up heartbeat to monitor connection health
                if (anvizDevice._heartbeatInterval) {
                    clearInterval(anvizDevice._heartbeatInterval);
                }
                
                anvizDevice._heartbeatInterval = setInterval(() => {
                    this.verifyDeviceConnection(anvizDevice, deviceId)
                        .then(() => {
                            // Connection is healthy
                        })
                        .catch((error) => {
                            this.logger.error(`Device ${deviceId} connection verification failed: ${error.message}`);
                            
                            // If heartbeat fails, connection is likely lost
                            if (anvizDevice.listener && anvizDevice.listener.onConnectionLost) {
                                anvizDevice.listener.onConnectionLost();
                            }
                        });
                }, 10000); // Check every 30 seconds to reduce overhead

                // log
                this.logger.log(`Connected to Anviz device ${deviceId} (${deviceInfo.serialNumber})`);
                
                // Update or create device in database
                return await this.deviceRepository.save(device);

            };

            // Execute with timeout
            return await this.executeWithTimeout(connectionPromise, 30000, 
                `Connection to device ${deviceId} timed out after 30 seconds`);
            
        } catch (error: any) {
            // Schedule automatic reconnection
            this.logger.error(`Failed to connect to Anviz device ${deviceId}: ${error.message}`);
            throw new InternalServerErrorException(`Failed to connect to Anviz device ${deviceId}`);
        }

    }

    /**
     * Map Anviz punch types to system punch types
     */
    private mapPunchType(backupCode: number): PunchType {
        switch (backupCode) {
            case 0:
                return PunchType.CHECK_IN;
            case 1:
                return PunchType.CHECK_OUT;
            case 2:
                return PunchType.BREAK_OUT;
            case 3:
                return PunchType.BREAK_IN;
            case 4:
                return PunchType.OVERTIME_IN;
            case 5:
                return PunchType.OVERTIME_OUT;
            default:
                return PunchType.CHECK_IN;
        }
    }

    /**
     * Schedule a reconnection attempt
     * @param deviceId Device identifier
     * @param attempt Current attempt number (default: 0)
     */
    private scheduleReconnect(
        deviceId: string, 
        attempt: number = 0
    ): number {
        // Calculate backoff time (exponential with max of 5 minutes)
        const backoffMs = Math.min(5000 * Math.pow(1.5, attempt), 300000);
    
        // Create new timer
        setTimeout(async () => {
            try {
                // Check if device exists in database before reconnecting
                const deviceInfo = await this.deviceRepository.findOne({ where: { deviceId } });
                if (!deviceInfo) {
                    this.logger.warn(`Device ${deviceId} no longer exists in database. Stopping reconnection attempts.`);
                    return;
                }
                
                // Try to reconnect
                await this.connectWithRetry(
                    { 
                        ipAddress: deviceInfo.ipAddress, 
                        port: deviceInfo.port,
                        deviceType: BiometricDeviceType.ANVIZ
                    } as ConnectDeviceDto, 
                    deviceId
                );
            } catch (error) {
                // If reconnection fails, schedule another attempt
                this.scheduleReconnect(deviceId, attempt + 1);
            }
        }, backoffMs);
        
        return attempt + 1;
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
     * @returns Disconnected device information
     */
    async disconnect(deviceId: string, isManual: boolean = false): Promise<BiometricDevice> {
        const anvizDevice = this.connections.get(deviceId);
        
        if (anvizDevice) {
            // Clear heartbeat interval
            if (anvizDevice._heartbeatInterval) {
                clearInterval(anvizDevice._heartbeatInterval);
                anvizDevice._heartbeatInterval = null;
            }
            
            try {
                anvizDevice.disconnect();
            } catch (err) {
                const error = err as Error;
                this.logger.warn(`Error during disconnect for device ${deviceId}: ${error.message}`);
            }

            // Remove from connections map
            this.connections.delete(deviceId);
        }

        // Clear command queue for device
        if (this.commandQueues.has(deviceId)) {
            const queue = this.commandQueues.get(deviceId)!;
            // Reject all pending commands
            for (const item of queue) {
                if (item.timeout) clearTimeout(item.timeout);
                item.reject(new Error(`Device ${deviceId} disconnected during operation '${item.operation}'`));
            }
            this.commandQueues.delete(deviceId);
            this.processingQueues.delete(deviceId);
        }

        return await this.updateDeviceStatus(deviceId, !isManual, true);
    }

    getPunchMethod(value: number): PunchMethod {
        switch (value) {
            case 35:
                return PunchMethod.FINGERPRINT;
            case 19:
                return PunchMethod.FINGERPRINT;
            case 8:
                return PunchMethod.RFID;
            case 4:
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
     * Get users from Anviz device
     * @param deviceId Device identifier
     */
    async getUsers(deviceId: string): Promise<IBiometricUser[]> {
        return this.queueCommand(deviceId, 'getUsers', async () => {
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
        });
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
            const createdUser = {
                userId: userData.userId,
                name: userData.name,
                password: userData.password || '', // Provide a default empty string if password is undefined
                cardNumber: userData.cardNumber,
                role: userData.role || 0,
                department: 1,
                attendanceMode: 0,
                enrolledFingerprints: []
            };
            
            this.logger.log(`Successfully registered user ${userData.userId} on device ${deviceId}`);
            return createdUser;
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

    /**
     * Get device time
     * @param deviceId Device identifier
     */
    async getTime(deviceId: string): Promise<Date> {
        return this.queueCommand(deviceId, 'getTime', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                return new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Get time operation timed out'));
                    }, 5000);
                    
                    const anvizDevice = this.getAnvizDevice(deviceId);
                    anvizDevice.getDateTime((date: any) => {
                        clearTimeout(timeoutId);
                        resolve(date);
                    });
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error getting device time: ${errorMessage}`);
                throw new BiometricException(`Failed to get device time: ${errorMessage}`);
            }
        });
    }

    /**
     * Set device time
     * @param deviceId Device identifier
     * @param time Date to set
     */
    async setTime(deviceId: string, time: Date): Promise<boolean> {
        return this.queueCommand(deviceId, 'setTime', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                return new Promise<boolean>((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Set time operation timed out'));
                    }, 5000);
                    
                    try {
                        const anvizDevice = this.getAnvizDevice(deviceId);
                        anvizDevice.setDateTime(time);
                        clearTimeout(timeoutId);
                        resolve(true);
                    } catch (error) {
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error setting device time: ${errorMessage}`);
                throw new BiometricException(`Failed to set device time: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Get the firmware version from device
     * @param deviceId Device identifier 
     */
    async getFirmwareVersion(deviceId: string): Promise<string> {
        return this.queueCommand(deviceId, 'getFirmwareVersion', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                const info = await this.getAnvizDeviceInfo(deviceId);
                return info.firmwareVersion || 'Unknown';
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error getting firmware version: ${errorMessage}`);
                throw new BiometricException(`Failed to get firmware version: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Get the serial number from device
     * @param deviceId Device identifier
     */
    async getSerialNumber(deviceId: string): Promise<string> {
        return this.queueCommand(deviceId, 'getSerialNumber', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                return new Promise<string>((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Get serial number operation timed out'));
                    }, 5000);
                    
                    const anvizDevice = this.getAnvizDevice(deviceId);
                    anvizDevice.getSerialNumber((serialNumber: string) => {
                        clearTimeout(timeoutId);
                        resolve(serialNumber || 'Unknown');
                    });
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error getting serial number: ${errorMessage}`);
                throw new BiometricException(`Failed to get serial number: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Get device name - Not directly supported by Anviz, returns model name from device info
     * @param deviceId Device identifier
     */
    async getDeviceName(deviceId: string): Promise<string> {
        return this.queueCommand(deviceId, 'getDeviceName', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                // Anviz doesn't provide a direct method to get the device name, so we return the device type
                const info = await this.getAnvizDeviceInfo(deviceId);
                return info.deviceType || 'Anviz Device';
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error getting device name: ${errorMessage}`);
                throw new BiometricException(`Failed to get device name: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Restart the Anviz device - Not directly supported by Anviz protocol
     * @param deviceId Device identifier
     */
    async restartDevice(deviceId: string): Promise<boolean> {
        return this.queueCommand(deviceId, 'restartDevice', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                // Anviz doesn't provide a direct method to restart the device
                // We'll simulate it by disconnecting and reconnecting
                const deviceInfo = await this.deviceRepository.findOne({ where: { deviceId } });
                if (!deviceInfo) {
                    throw new BiometricException(`Device ${deviceId} not found in database`, HttpStatus.NOT_FOUND);
                }
                
                await this.disconnect(deviceId, true);
                
                // Wait a moment before reconnecting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await this.connectWithRetry({
                    ipAddress: deviceInfo.ipAddress,
                    port: deviceInfo.port,
                    deviceType: BiometricDeviceType.ANVIZ
                } as ConnectDeviceDto, deviceId);
                
                return true;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error restarting device: ${errorMessage}`);
                throw new BiometricException(`Failed to restart device: ${errorMessage}`, HttpStatus.NOT_IMPLEMENTED);
            }
        });
    }
    
    /**
     * Get user details (enhanced user information)
     * @param deviceId Device identifier
     */
    async getUserDetails(deviceId: string): Promise<IBiometricUser[]> {
        // For Anviz devices, getUserDetails and getUsers return the same information
        return this.getUsers(deviceId);
    }
    
    /**
     * Enroll a user's fingerprint
     * Anviz devices don't support direct enrollment via API, must be done on the device
     * @param deviceId Device identifier
     * @param userId User ID
     * @param fingerId Finger ID
     */
    async enrollUser(deviceId: string, userId: string, fingerId: number): Promise<IBiometricTemplate> {
        throw new BiometricException(
            'Fingerprint enrollment via API is not supported by Anviz devices. Users must enroll fingerprints directly on the device.',
            HttpStatus.NOT_IMPLEMENTED
        );
    }
    
    /**
     * Verify fingerprint on device - Not directly supported by Anviz via API
     * @param deviceId Device identifier
     * @param template Template to verify
     */
    async verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean> {
        throw new BiometricException(
            'Fingerprint verification via API is not supported by Anviz devices',
            HttpStatus.NOT_IMPLEMENTED
        );
    }
    
    /**
     * Set a user on the device with more detailed options
     * @param deviceId Device identifier
     * @param uid Internal user ID
     * @param userId External user ID
     * @param name User name
     * @param password User password (optional)
     * @param role User role (optional)
     * @param cardno Card number (optional)
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
        return this.queueCommand(deviceId, 'setUser', async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                this.logger.log(`Setting user ${userId} on device ${deviceId}`);
                
                const anvizDevice = this.getAnvizDevice(deviceId);
                
                // Create Anviz user object
                const userInfo = {
                    userId: parseInt(userId), 
                    name,
                    password: password ? parseInt(password) : 0,
                    passwordLength: password ? password.length : 0,
                    card: cardno || 0,
                    group: role || 0,
                    dpt: 1, // Department (default: 1)
                    attendanceMode: 0 // Default mode
                };
                
                return new Promise<boolean>((resolve, reject) => {
                    try {
                        anvizDevice.setUserInfo(userInfo);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error setting user on device ${deviceId}: ${errorMessage}`);
                throw new BiometricException(`Failed to set user: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Sync users from one device to another
     * @param sourceDeviceId Source device ID
     * @param targetDeviceId Target device ID
     */
    async syncUsers(sourceDeviceId: string, targetDeviceId: string): Promise<number> {
        return this.queueCommand(sourceDeviceId, `syncUsers-to-${targetDeviceId}`, async () => {
            try {
                this.checkDeviceConnection(sourceDeviceId);
                this.checkDeviceConnection(targetDeviceId);
                
                this.logger.log(`Syncing users from device ${sourceDeviceId} to device ${targetDeviceId}`);
                
                // Get users from source device
                const users = await this.getUsers(sourceDeviceId);
                
                // Create sync queue for target device
                let syncCount = 0;
                
                // Process each user
                for (const user of users) {
                    try {
                        // Register user on target device
                        await this.registerUser(targetDeviceId, {
                            userId: user.userId,
                            name: user.name,
                            password: user.password,
                            cardNumber: user.cardNumber,
                            role: user.role
                        });
                        
                        syncCount++;
                    } catch (userError) {
                        const error = userError as Error;
                        this.logger.warn(`Error syncing user ${user.userId}: ${error.message}`);
                        // Continue with next user
                    }
                }
                
                this.logger.log(`Successfully synced ${syncCount} users from ${sourceDeviceId} to ${targetDeviceId}`);
                return syncCount;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error syncing users: ${errorMessage}`);
                throw new BiometricException(`Failed to sync users: ${errorMessage}`);
            }
        });
    }
    
    /**
     * Execute a custom command on the device
     * @param deviceId Device identifier
     * @param command Command to execute
     * @param data Additional data for the command
     */
    async executeCommand(deviceId: string, command: string, data?: string): Promise<any> {
        return this.queueCommand(deviceId, `executeCommand-${command}`, async () => {
            try {
                this.checkDeviceConnection(deviceId);
                
                this.logger.log(`Executing custom command '${command}' on device ${deviceId}`);
                
                // Map command string to Anviz protocol command code
                const commandMap: Record<string, number> = {
                    'get_device_id': 0x74,
                    'set_device_id': 0x75,
                    'get_device_info1': 0x30,
                    'set_device_info1': 0x31,
                    'get_device_info2': 0x32,
                    'set_device_info2': 0x33,
                    'get_serial_number': 0x24,
                    'get_date_time': 0x38,
                    'set_date_time': 0x39,
                    'get_record_info': 0x3C,
                    'get_records': 0x40,
                    'clear_records': 0x4E,
                    'get_user_info': 0x72,
                    'set_user_info': 0x73,
                    'delete_user': 0x4C,
                    'get_fp_template': 0x44,
                    'set_fp_template': 0x45,
                    'open_lock': 0x5E
                };
                
                const commandCode = commandMap[command.toLowerCase()];
                if (!commandCode) {
                    throw new BiometricException(`Unsupported command: ${command}`, HttpStatus.BAD_REQUEST);
                }
                
                // Convert data string to Buffer if provided
                let dataBuffer: Buffer | undefined;
                if (data) {
                    try {
                        // Try to parse as JSON first
                        const jsonData = JSON.parse(data);
                        // Convert JSON to buffer (implementation depends on command)
                        // This is a simplified example
                        dataBuffer = Buffer.from(JSON.stringify(jsonData));
                    } catch {
                        // If not JSON, treat as hex string
                        dataBuffer = Buffer.from(data, 'hex');
                    }
                }
                
                // Execute command (this is a simplified example)
                // In a real implementation, you would need to handle different commands differently
                throw new BiometricException(
                    'Custom command execution is not fully implemented',
                    HttpStatus.NOT_IMPLEMENTED
                );
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error executing command: ${errorMessage}`);
                throw new BiometricException(`Failed to execute command: ${errorMessage}`);
            }
        });
    }
}