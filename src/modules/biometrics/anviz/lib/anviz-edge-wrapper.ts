import { Logger } from '@nestjs/common';
import * as edge from 'edge-js';
import { EventEmitter } from 'events';
import * as path from 'path';
import {
  AnvizAttendanceRecord,
  AnvizConnectionOptions,
  AnvizDeviceInfo,
  AnvizEmployeeInfo
} from './anviz-types';

export class AnvizEdgeWrapper extends EventEmitter {
  private readonly logger = new Logger('AnvizEdgeWrapper');
  private dotNetMethods: Record<string, any> = {};
  private deviceId: string;
  private connected = false;

  constructor(options: AnvizConnectionOptions) {
    super();
    this.deviceId = options.deviceId.toString();
    
    // Define paths for Edge.js
    const dllPath = path.join(__dirname, 'AnvizDotNetBridge.dll');
    
    // Initialize Edge.js methods
    this.initEdgeMethods(dllPath);
  }

  private initEdgeMethods(dllPath: string) {
    try {
      // Define all the methods we need from .NET
      this.dotNetMethods = {
        connect: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'Connect'
        }),
        disconnect: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'Disconnect'
        }),
        getDeviceInfo: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'GetDeviceInfo'
        }),
        getAttendanceRecords: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'GetAttendanceRecords'
        }),
        getEmployees: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'GetEmployees'
        }),
        addEmployee: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'AddEmployee'
        }),
        startMonitoring: edge.func({
          assemblyFile: dllPath,
          typeName: 'AnvizDotNetBridge',
          methodName: 'StartMonitoring'
        }),
        // Add more methods as needed...
      };
      
      this.logger.log('Edge.js methods initialized successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize Edge.js methods: ${errorMsg}`);
      throw error;
    }
  }

  public async connect(): Promise<void> {
    try {
      const result = await this.invokeEdgeMethod('connect', {
        deviceId: this.deviceId,
        ipAddress: this.options.host,
        port: this.port || 4370,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      this.connected = true;
      this.logger.log(`Successfully connected to Anviz device ${this.deviceId}`);
      this.emit('connected');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Anviz device: ${errorMsg}`);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const result = await this.invokeEdgeMethod('disconnect', {
        deviceId: this.deviceId
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      this.connected = false;
      this.logger.log(`Successfully disconnected from Anviz device ${this.deviceId}`);
      this.emit('disconnected');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to disconnect from Anviz device: ${errorMsg}`);
      throw error;
    }
  }

  public async getDeviceInfo(): Promise<AnvizDeviceInfo> {
    try {
      const result = await this.invokeEdgeMethod('getDeviceInfo', {
        deviceId: this.deviceId
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      return {
        serialNumber: result.deviceInfo.serialNumber,
        firmwareVersion: result.deviceInfo.firmwareVersion,
        deviceModel: result.deviceInfo.deviceModel,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get device info: ${errorMsg}`);
      throw error;
    }
  }

  public async getAttendanceRecords(newOnly = false): Promise<AnvizAttendanceRecord[]> {
    try {
      const result = await this.invokeEdgeMethod('getAttendanceRecords', {
        deviceId: this.deviceId,
        newOnly
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Transform records to match your expected type
      return result.records.map((record: any) => ({
        userId: record.userId,
        timestamp: new Date(record.timestamp),
        attendanceType: record.attendanceType,
        verifyMethod: record.verifyMethod,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get attendance records: ${errorMsg}`);
      throw error;
    }
  }

  public async getEmployees(): Promise<AnvizEmployeeInfo[]> {
    try {
      const result = await this.invokeEdgeMethod('getEmployees', {
        deviceId: this.deviceId
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.employees.map((employee: any) => ({
        userId: employee.userId,
        name: employee.name,
        password: employee.password,
        cardNumber: employee.cardNumber,
        privilege: employee.privilege,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get employees: ${errorMsg}`);
      throw error;
    }
  }

  public async addEmployee(employee: AnvizEmployeeInfo): Promise<boolean> {
    try {
      const result = await this.invokeEdgeMethod('addEmployee', {
        deviceId: this.deviceId,
        userId: employee.userId,
        name: employee.name,
        password: employee.password,
        cardNumber: employee.cardNumber,
        privilege: employee.privilege
      });

      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      
      return result.success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to add employee: ${errorMsg}`);
      throw error;
    }
  }

  public async startMonitoring(): Promise<void> {
    try {
      const result = await this.invokeEdgeMethod('startMonitoring', {
        deviceId: this.deviceId
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      this.logger.log(`Started real-time monitoring for device ${this.deviceId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start monitoring: ${errorMsg}`);
      throw error;
    }
  }

  // Implement additional methods as needed, mirroring your original SDK interface

  private invokeEdgeMethod(methodName: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.dotNetMethods[methodName]) {
        reject(new Error(`Method ${methodName} not found`));
        return;
      }
      
      this.dotNetMethods[methodName](params, (error: Error, result: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }
}