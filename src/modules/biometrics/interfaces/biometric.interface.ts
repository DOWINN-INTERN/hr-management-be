import { PunchMethod } from "@/common/enums/punch-method.enum";
import { PunchType } from "@/common/enums/punch-type.enum";
import { ConnectDeviceDto } from "../dtos/connect-device.dto";
import { BiometricDevice } from "../entities/biometric-device.entity";

export interface IBiometricTemplate {
    id: string;
    userId: string;
    fingerId: number;
    template: Buffer | string;
    provider: string;
}

export interface IBiometricService {
    // Core device management (required)
    connect(dto: ConnectDeviceDto): Promise<BiometricDevice>;
    disconnect(deviceId: string): Promise<BiometricDevice>;
    
    // Device information methods
    getSerialNumber(deviceId: string): Promise<string>;
    getFirmwareVersion(deviceId: string): Promise<string>;
    getDeviceName(deviceId: string): Promise<string>;
    restartDevice(deviceId: string): Promise<boolean>;
    registerUser(
        deviceId: string, 
        userData: {
            userId: string;
            name: string;
            password?: string;
            cardNumber?: string;
            role?: number;
        }
    ): Promise<IBiometricUser>;

    getUserFingerprint(
        deviceId: string,
        userId: string,
        fingerId?: number
    ): Promise<IBiometricTemplate | null>;
    
    // Time management methods
    getTime(deviceId: string): Promise<Date>;
    setTime(deviceId: string, time: Date): Promise<boolean>;
    
    // User management methods
    enrollUser(deviceId: string, userId: string, fingerId: number): Promise<IBiometricTemplate>;
    deleteUser(deviceId: string, userId: string): Promise<boolean>;
    verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean>;
    getUsers(deviceId: string): Promise<IBiometricUser[]>;
    getUserDetails(deviceId: string): Promise<IBiometricUser[]>;
    setUser(
        deviceId: string,
        uid: number,
        userId: string,
        name: string,
        password?: string,
        role?: number,
        cardno?: number
    ): Promise<boolean>;
    syncUsers(sourceDeviceId: string, targetDeviceId: string): Promise<number>;
    
    // Attendance management methods
    getAttendanceRecords(deviceId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]>;
    clearAttendanceRecords(deviceId: string): Promise<boolean>;
    getAttendanceSize(deviceId: string): Promise<number>;
    
    // Door control
    unlockDoor(deviceId: string): Promise<boolean>;
    
    // Command execution
    executeCommand(deviceId: string, command: string, data?: string): Promise<any>;
}

  /**
 * Represents a standardized attendance record from a biometric device
 */
export interface AttendanceRecord {
    userId: string;
    timestamp: Date;
    punchType: PunchType;
    punchMethod: PunchMethod;
    deviceId: string;
}

/**
 * User information from a biometric device
 */
export interface IBiometricUser {
    /**
     * User ID in the system
     */
    userId: string;

    /**
     * User's name
     */
    name: string;

    /**
     * User's password (if applicable)
     */
    password: string;

    /**
     * Card number
     */
    cardNumber?: string;

    /**
     * User role (0=normal user, 14=admin)
     */
    role: number;
}