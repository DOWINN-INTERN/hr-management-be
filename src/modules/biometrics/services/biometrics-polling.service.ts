import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceRecord } from '../interfaces/biometric.interface';

@Injectable()
export class BiometricsPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BiometricsPollingService.name);
  private devicePollers = new Map<string, { intervalId: number; lastCheckedTime: Date; lastCount: number }>();
  private connections = new Map<string, any>();
  
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
    this.logger.log(`Registered device ${deviceId} for polling`);
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
    let lastAttendanceCount = 0;
    let lastCheckedTime = new Date();
    
    // Start the interval for polling
    const intervalId = setInterval(async () => {
      if (!this.connections.has(deviceId)) {
        this.stopPolling(deviceId);
        return;
      }
    
      try {
        // Get current attendance size
        const currentCount = await zkDevice.getAttendanceSize();
        
        // If there are new records
        if (currentCount > lastAttendanceCount) {
          // Get all attendance records - returns { data: records, err: error }
          const response = await zkDevice.getAttendances();

          // Extract the records array from the response
          const records = response.data || [];

          // Filter to only get records since last check
          const newRecords = records.filter((record: any) => 
            new Date(record.record_time) > lastCheckedTime
          );

          if (newRecords.length > 0) {
            this.logger.log(`[${deviceId}] Processing ${newRecords.length} new attendance records`);
            
            // Process each new record
            newRecords.forEach((record: any) => {
              // Standardize record format
              const standardizedRecord: AttendanceRecord = {
                userId: record.user_id || '',
                timestamp: new Date(record.record_time || Date.now()),
                type: record.type ?? 0,
                deviceId: deviceId,
                status: record.state
              };

              this.logger.log(`User ID: ${standardizedRecord.userId}, Type: ${standardizedRecord.type}, Timestamp: ${standardizedRecord.timestamp}`);

              // Emit the event
              this.eventEmitter.emit('attendance.recorded', standardizedRecord);
            });
          }
          
          // Update counters
          lastAttendanceCount = currentCount;
        }
        
        // Update timestamp
        lastCheckedTime = new Date();
      } catch (error) {
        this.logger.error(`Polling error for ${deviceId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, pollingInterval);
  
    // Store interval info to clean up later
    this.devicePollers.set(deviceId, { 
      intervalId: intervalId as unknown as number,
      lastCheckedTime,
      lastCount: lastAttendanceCount
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