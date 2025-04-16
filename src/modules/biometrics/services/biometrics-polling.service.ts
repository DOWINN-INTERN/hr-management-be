import { ATTENDANCE_EVENTS, AttendanceRecordedEvent } from '@/common/events/attendance-recorded.event';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceRecord } from '../interfaces/biometric.interface';

@Injectable()
export class BiometricsPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BiometricsPollingService.name);
  private devicePollers = new Map<string, { intervalId: number; lastCheckedTime: Date; }>();
  private connections = new Map<string, any>();
  private recordCache = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Lifecycle hooks
  onModuleInit() {
    this.logger.log('Biometric polling service initialized');
  }

  onModuleDestroy() {
    this.stopAllPolling();
  }

  // Provide a way to register device connections
  registerDeviceConnection(deviceId: string, zkDevice: any) {
    this.connections.set(deviceId, zkDevice);
    // this.logger.log(`Registered device ${deviceId} for polling`);
  }

  // Start polling for a specific device
  startPolling(deviceId: string): boolean {
    const zkDevice = this.connections.get(deviceId);
    if (!zkDevice) {
      this.logger.warn(`Cannot start polling for device ${deviceId}: Device not registered`);
      return false;
    }

    // Check if already polling
    if (this.devicePollers.has(deviceId)) {
      this.logger.warn(`Already polling device ${deviceId}`);
      return true;
    }

    const pollingInterval = this.configService.get<number>('BIOMETRIC_DEVICE_POLLING_INTERVAL', 1000);
    // let lastAttendanceCount = 0;
    let lastCheckedTime = new Date();
    
    // Start the interval for polling
    const intervalId = setInterval(async () => {
      if (!this.connections.has(deviceId)) {
        // log 
        this.logger.warn(`Device ${deviceId} not registered, stopping polling`);
        this.stopPolling(deviceId);
        return;
      }
    
      try {
        // Get current attendance size
        const currentCount = await zkDevice.getAttendanceSize();
        
        // If there are new records
        if (currentCount > 0) {
          // Get all attendance records - returns { data: records, err: error }
          const response = await zkDevice.getAttendances();
      
          // Extract the records array from the response
          const records = response.data || [];
      
          // Filter new records and use a cache to prevent duplicates
          const filteredRecords = records.filter((record: any) => {
            // Basic validation
            const hasValidUserId = record.user_id !== undefined && 
              record.user_id !== null && 
              record.user_id.trim() !== '';  // Check after trimming
            if (!hasValidUserId) return false;
            
            // Year validation
            const recordTime = new Date(record.record_time);
            const recordYear = recordTime.getFullYear();
            const currentYear = new Date().getFullYear();
            const isReasonableYear = Math.abs(recordYear - currentYear) <= 5;
            if (!isReasonableYear) return false;
            
            // Create a unique key to detect duplicates
            const cacheKey = `${record.user_id}-${record.record_time}-${record.type || 0}`;
            
            // Skip if we've seen this record before
            if (this.recordCache.has(cacheKey)) {
              return false;
            }
            
            // Add to cache and accept the record
            this.recordCache.add(cacheKey);
            
            // Limit cache size to prevent memory leaks
            if (this.recordCache.size > 10000) {
              // Remove oldest entries (converting to array first)
              const cacheArray = Array.from(this.recordCache);
              this.recordCache = new Set(cacheArray.slice(-5000));
            }
            
            return true;
          });
      
          if (filteredRecords.length > 0) {
            this.logger.log(`[${deviceId}] Processing ${filteredRecords.length} new attendance records`);
            
            let attendances: AttendanceRecord[] = [];

            // Process each new record
            filteredRecords.forEach((record: any) => {
              // Standardize record format
              const standardizedRecord: AttendanceRecord = {
                userId: record.user_id.trim(), // Trim any whitespace
                timestamp: new Date(record.record_time || Date.now()),
                type: record.type ?? 0,
                deviceId: deviceId,
                status: record.state
              };

              // Add to the attendance list
              attendances.push(standardizedRecord);
            });

            // Emit event for new records
            this.eventEmitter.emit(ATTENDANCE_EVENTS.ATTENDANCE_RECORDED, new AttendanceRecordedEvent(attendances, deviceId));
          }
          
          // Update counters
          // lastAttendanceCount = currentCount;
        }
        
        // Update timestamp
        lastCheckedTime = new Date();
      } catch (error) {
          this.logger.error(`Polling error for ${deviceId}: ${error instanceof Error 
            ? JSON.stringify(Object.assign({}, error, { message: error.message, stack: error.stack })) 
            : JSON.stringify(error)}`);
      }
    }, pollingInterval);
  
    // Store interval info to clean up later
    this.devicePollers.set(deviceId, { 
      intervalId: intervalId as unknown as number,
      lastCheckedTime,
    });
    
    this.logger.log(`Started polling for device ${deviceId} at ${pollingInterval}ms intervals`);
    return true;
  }

  // Stop polling for a specific device
  stopPolling(deviceId: string): boolean {
    const poller = this.devicePollers.get(deviceId);
    if (!poller) {
      return false;
    }

    clearInterval(poller.intervalId);
    this.devicePollers.delete(deviceId);
    this.logger.log(`Stopped polling for device ${deviceId}`);
    return true;
  }

  // Stop all polling
  stopAllPolling(): void {
    this.logger.log(`Stopping all device polling (${this.devicePollers.size} active)`);
    
    for (const [deviceId, poller] of this.devicePollers.entries()) {
      clearInterval(poller.intervalId);
      this.logger.log(`Stopped polling for device ${deviceId}`);
    }
    
    this.devicePollers.clear();
  }
}