export interface AnvizConnectionOptions {
  host: string;
  port?: number;
  timeout?: number;
  deviceId?: number;
}

export interface AnvizDeviceInfo {
  serialNumber: string;
  deviceModel: number;
  communicationVersion: number;
  firmwareVersion: string;
  manufactureDate: string;
  deviceCapacity: {
    users: number;
    fingerprints: number;
    records: number;
  };
}

export interface AnvizAttendanceRecord {
  userId: string;
  timestamp: Date;
  verifyMethod: string;
  attendanceType: string;
  deviceCode?: number;   // Added to match JavaScript example
}

export interface AnvizEmployeeInfo {
  userId: string;
  name: string;
  password?: string;
  cardNumber?: string;
  department?: number;
  group?: number;
  privilege?: number;
}

export interface AnvizDeviceStatus {
  isConnected: boolean;
  lastCommunication: Date | null;
  serialNumber: string | null;
  firmwareVersion: string | null;
}

export interface AnvizFingerprintTemplate {
  userId: string;
  fingerId: number;
  templateData: Buffer;
}

export enum AnvizPrivilege {
  USER = 0,
  ENROLLER = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3
}

export enum AnvizVerifyMethod {
  NONE = 0,
  FINGER = 1,
  PASSWORD = 2,
  CARD = 3,
  FACE = 4,
  PALM = 5
}

export enum AnvizAttendanceType {
  CHECK_IN = 0,
  CHECK_OUT = 1,
  BREAK_OUT = 2,
  BREAK_IN = 3,
  OVERTIME_IN = 4,
  OVERTIME_OUT = 5
}

export enum AnvizCommand {
  // Common commands
  DEVICE_INFO = 0x30,
  GET_TIME = 0x38,
  SET_TIME = 0x39,
  REBOOT = 0x3C,
  
  // Attendance commands
  GET_RECORDS = 0x40,
  CLEAR_RECORDS = 0x42,
  
  // Employee commands
  ADD_EMPLOYEE = 0x71,
  GET_ALL_EMPLOYEES = 0x72,
  DELETE_EMPLOYEE = 0x73,
  
  // Fingerprint commands
  GET_FINGERPRINT = 0x43,
  SET_FINGERPRINT = 0x44,
  
  // Monitoring commands
  MONITORING_CONTROL = 0x20
}