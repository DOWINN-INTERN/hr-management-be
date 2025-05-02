import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as net from 'net';
import { AnvizProtocol } from './anviz-protocol';
import {
  AnvizAttendanceRecord,
  AnvizConnectionOptions,
  AnvizDeviceInfo,
  AnvizDeviceStatus,
  AnvizEmployeeInfo
} from './anviz-types';

export class AnvizSdk extends EventEmitter {
  private socket: net.Socket | null = null;
  private protocol: AnvizProtocol;
  private connected = false;
  private buffer: Buffer = Buffer.alloc(0);
  private responseCallbacks: Map<number, { resolve: Function, reject: Function, commandId: number }> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private deviceId: number;
  private deviceStatus: AnvizDeviceStatus = {
    isConnected: false,
    lastCommunication: null,
    serialNumber: null,
    firmwareVersion: null
  };
  private readonly logger = new Logger('AnvizSdk');
  private readonly commandTimeout: number;
  private monitoring = false;
  
  // Command queue system
  private commandQueue: Array<{
    command: Buffer;
    resolve: Function;
    reject: Function;
    timeout: number;
  }> = [];
  private processingCommand = false;
  
  constructor(private options: AnvizConnectionOptions) {
    super();
    this.deviceId = options.deviceId || 0;
    this.protocol = new AnvizProtocol(this.deviceId);
    this.commandTimeout = options.timeout || 20000;
  }

  public connect(): Promise<void> {
    // If already connected, return resolved promise
    if (this.socket && this.connected) {
      return Promise.resolve();
    }
    
    if (this.connectionPromise) {
      this.logger.debug(`Connection already in progress, reusing existing promise`);
      return this.connectionPromise;
    }

    // Reset any existing socket
    if (this.socket) {
      try {
        this.socket.destroy();
        this.socket = null;
      } catch (error) {
        // Ignore errors on cleanup
      }
    }
    
    // Reset buffer on new connection
    this.buffer = Buffer.alloc(0);

    this.logger.debug(`Initiating connection to ${this.options.host}:${this.options.port || 4370}, device ID: ${this.deviceId}, timeout: ${this.commandTimeout}ms`);

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        this.socket = new net.Socket();
        
        this.socket.setTimeout(this.commandTimeout);
        
        this.socket.on('data', (data: Buffer) => {
          this.logger.debug(`Received ${data.length} bytes of data from device: ${data.toString('hex')}`);
          this.handleData(data);
        });
        
        this.socket.on('error', (err: Error) => {
          this.logger.error(`Socket error: ${err.message}`);
          this.emit('error', err);
          this.deviceStatus.isConnected = false;
          reject(err);
          this.connectionPromise = null;
        });
        
        this.socket.on('close', () => {
          this.logger.warn(`Socket connection closed`);
          this.connected = false;
          this.deviceStatus.isConnected = false;
          this.emit('disconnected');
          
          // Reject all pending promises
          for (const [, callback] of this.responseCallbacks) {
            callback.reject(new Error('Connection closed'));
          }
          this.responseCallbacks.clear();
          this.connectionPromise = null;
        });
        
        this.socket.on('timeout', () => {
          this.logger.warn(`Socket timeout occurred`);
          this.socket?.destroy(new Error('Socket timeout'));
        });
        
        this.logger.debug(`Attempting socket connection to ${this.options.host}:${this.options.port || 4370}`);
        this.socket.connect({
          host: this.options.host,
          port: this.options.port || 4370
        }, () => {
          this.connected = true;
          this.deviceStatus.isConnected = true;
          this.deviceStatus.lastCommunication = new Date();
          this.logger.debug(`Socket connected successfully to ${this.options.host}:${this.options.port || 4370}`);
          this.emit('connected');
          resolve();
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Connection error: ${errorMsg}`);
        this.connectionPromise = null;
        reject(error);
      }
    });
    
    return this.connectionPromise;
  }

  public async disconnect(): Promise<void> {
    if (!this.socket || !this.connected) {
      return;
    }
    
    if (this.monitoring) {
      try {
        await this.stopMonitoring();
      } catch (error) {
        // Ignore errors when stopping monitoring during disconnect
      }
    }
    
    return new Promise<void>((resolve) => {
      if (this.socket) {
        this.socket.end(() => {
          this.socket = null;
          this.connected = false;
          this.deviceStatus.isConnected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public async getDeviceInfo(): Promise<AnvizDeviceInfo> {
    const command = this.protocol.createDeviceInfoCommand();
    const response = await this.sendCommand(command);
    const deviceInfo = this.protocol.parseDeviceInfoResponse(response);
    
    // Update device status
    this.deviceStatus.serialNumber = deviceInfo.serialNumber;
    this.deviceStatus.firmwareVersion = deviceInfo.firmwareVersion;
    
    return deviceInfo;
  }

  public async getAttendanceRecords(newOnly = false): Promise<AnvizAttendanceRecord[]> {
    const command = this.protocol.createGetAttendanceCommand(newOnly);
    const response = await this.sendCommand(command);
    return this.protocol.parseAttendanceRecords(response);
  }

  public async getEmployees(): Promise<AnvizEmployeeInfo[]> {
    const command = this.protocol.createGetAllEmployeeCommand();
    const response = await this.sendCommand(command);
    return this.protocol.parseEmployeeRecords(response);
  }

  public async addEmployee(employee: AnvizEmployeeInfo): Promise<boolean> {
    const command = this.protocol.createAddEmployeeCommand(employee);
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async deleteEmployee(userId: string): Promise<boolean> {
    const command = this.protocol.createDeleteEmployeeCommand(userId);
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async setTime(date?: Date): Promise<boolean> {
    const command = this.protocol.createSetTimeCommand(date || new Date());
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async getTime(): Promise<Date> {
    const command = this.protocol.createGetTimeCommand();
    const response = await this.sendCommand(command);
    return this.protocol.parseTimeResponse(response);
  }

  public async clearAttendanceRecords(): Promise<boolean> {
    const command = this.protocol.createClearAttendanceCommand();
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async getFingerprintTemplate(userId: string, fingerId: number): Promise<Buffer | null> {
    const command = this.protocol.createGetFingerprintCommand(userId, fingerId);
    const response = await this.sendCommand(command);
    return this.protocol.parseFingerprintResponse(response);
  }

  public async setFingerprintTemplate(userId: string, fingerId: number, template: Buffer): Promise<boolean> {
    const command = this.protocol.createSetFingerprintCommand(userId, fingerId, template);
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async reboot(): Promise<boolean> {
    const command = this.protocol.createRebootCommand();
    const response = await this.sendCommand(command);
    return this.protocol.parseGenericResponse(response);
  }

  public async ping(): Promise<boolean> {
    try {
      const command = this.protocol.createPingCommand();
      const response = await this.sendCommand(command, 3000);
      const result = this.protocol.parsePingResponse(response);
      if (result) {
        this.deviceStatus.lastCommunication = new Date();
        this.deviceStatus.isConnected = true;
      }
      return result;
    } catch (error) {
      this.deviceStatus.isConnected = false;
      return false;
    }
  }

  public getDeviceStatus(): AnvizDeviceStatus {
    return { ...this.deviceStatus };
  }

  public async startMonitoring(): Promise<void> {
    const command = this.protocol.createStartMonitoringCommand();
    await this.sendCommand(command);
    this.monitoring = true;
    this.emit('monitoring:started');
  }

  public async stopMonitoring(): Promise<void> {
    const command = this.protocol.createStopMonitoringCommand();
    await this.sendCommand(command);
    this.monitoring = false;
    this.emit('monitoring:stopped');
  }

  private sendCommandRaw(command: Buffer): void {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to device');
    }
    
    this.logger.debug(`Sending raw data: ${command.toString('hex')}`);
    this.socket.write(command);
    this.deviceStatus.lastCommunication = new Date();
  }

  private async processCommandQueue(): Promise<void> {
    if (this.processingCommand || this.commandQueue.length === 0) {
      return;
    }
    
    this.processingCommand = true;
    const { command, resolve, reject, timeout } = this.commandQueue[0];
    
    try {
      if (!this.socket || !this.connected) {
        await this.connect();
      }
      
      const sequence = this.protocol.getSequence(command);
      const commandId = this.protocol.getCommandId(command);
      
      this.logger.debug(`Processing queued command 0x${commandId.toString(16)} with sequence ${sequence}`);
      
      // Set timeout for command
      const timeoutId = setTimeout(() => {
        this.responseCallbacks.delete(sequence);
        this.logger.error(`Command 0x${commandId.toString(16)} with sequence ${sequence} timed out after ${timeout}ms`);
        this.commandQueue.shift();
        this.processingCommand = false;
        reject(new Error(`Command timed out after ${timeout}ms`));
        
        // Process next command in queue if any
        if (this.commandQueue.length > 0) {
          this.processCommandQueue();
        }
      }, timeout);
      
      // Store callback
      this.responseCallbacks.set(sequence, {
        resolve: (data: Buffer) => {
          clearTimeout(timeoutId);
          this.logger.debug(`Received response for command 0x${commandId.toString(16)} with sequence ${sequence}, length: ${data.length} bytes`);
          this.commandQueue.shift();
          this.processingCommand = false;
          resolve(data);
          
          // Process next command in queue if any
          if (this.commandQueue.length > 0) {
            setTimeout(() => this.processCommandQueue(), 50); // Small delay between commands
          }
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId);
          this.logger.error(`Error for command 0x${commandId.toString(16)} with sequence ${sequence}: ${error.message}`);
          this.commandQueue.shift();
          this.processingCommand = false;
          reject(error);
          
          // Process next command in queue if any
          if (this.commandQueue.length > 0) {
            setTimeout(() => this.processCommandQueue(), 50); // Small delay between commands
          }
        },
        commandId
      });
      
      // Send command
      this.sendCommandRaw(command);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process queued command: ${errorMsg}`);
      this.commandQueue.shift();
      this.processingCommand = false;
      reject(error);
      
      // Process next command in queue if any
      if (this.commandQueue.length > 0) {
        setTimeout(() => this.processCommandQueue(), 50); // Small delay between commands
      }
    }
  }

  private async sendCommand(command: Buffer, timeout = this.commandTimeout): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      // Add command to queue
      this.commandQueue.push({ command, resolve, reject, timeout });
      
      // Start processing queue if not already
      if (!this.processingCommand) {
        this.processCommandQueue();
      }
    });
  }

  private handleData(data: Buffer): void {
    try {
      // Combine with any previous buffered data
      this.buffer = Buffer.concat([this.buffer, data]);
      
      // Process all complete packets in buffer
      let packetInfo = this.protocol.extractPacket(this.buffer);
      
      while (packetInfo.packet) {
        const { packet, remainingData } = packetInfo;
        this.buffer = remainingData;
        
        // Update last communication timestamp
        this.deviceStatus.lastCommunication = new Date();
        
        // Process the packet
        this.processPacket(packet);
        
        // Look for more packets
        packetInfo = this.protocol.extractPacket(this.buffer);
      }
      
      // If buffer gets too large without valid packets, clear it
      if (this.buffer.length > 1024) {
        this.logger.warn(`Buffer overflow (${this.buffer.length} bytes) - clearing`);
        this.buffer = Buffer.alloc(0);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling data: ${errorMessage}`);
    }
  }

  private processPacket(packet: Buffer): void {
    const sequence = this.protocol.getSequence(packet);
    const commandId = this.protocol.getCommandId(packet);
    
    this.logger.debug(`Processing packet with command ID: 0x${commandId.toString(16)}, sequence: ${sequence}`);
    
    // Check if this is a real-time event (0xDF)
    if (commandId === 0xDF) {
      const records = this.protocol.parseRealtimeRecord(packet);
      if (records && records.length > 0) {
        records.forEach(record => {
          this.emit('attendance', record);
        });
      }
      return;
    }
    
    // Check for device ping (0x7F)
    if (commandId === 0x7F) {
      this.emit('ping');
      return;
    }
    
    // Find matching callback for regular command response
    const callback = this.responseCallbacks.get(sequence);
    if (callback) {
      this.responseCallbacks.delete(sequence);
      
      // In Anviz protocol, response command ID is original command + 0x80
      const expectedResponseId = (callback.commandId + 0x80) & 0xFF;
      
      this.logger.debug(`Response has command ID 0x${commandId.toString(16)}, expected 0x${expectedResponseId.toString(16)}`);
      
      // Verify command ID matches expected response
      if (commandId !== expectedResponseId && commandId !== 0x00) {
        callback.reject(new Error(`Response command ID ${commandId.toString(16)} does not match expected ${expectedResponseId.toString(16)} for command ${callback.commandId.toString(16)}`));
        return;
      }
      
      // Check for error in response
      if (this.protocol.isErrorResponse(packet)) {
        const errorCode = this.protocol.getErrorCode(packet);
        callback.reject(new Error(`Device returned error code: ${errorCode}`));
        return;
      }
      
      callback.resolve(packet);
    } else {
      // No callback found for this sequence, might be another type of event
      this.logger.warn(`No callback found for packet with sequence ${sequence}, command ID 0x${commandId.toString(16)}`);
      this.emit('unknownPacket', packet);
    }
  }
}