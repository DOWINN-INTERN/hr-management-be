import { PunchMethod } from "@/common/enums/punch-method.enum";
import { PunchType } from "@/common/enums/punch-type.enum";
import { BiometricUserDto, GetBiometricUserDto } from "../dtos/biometric-user.dto";
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
    connect(dto: ConnectDeviceDto, createdBy?: string): Promise<BiometricDevice>;
    disconnect(deviceId: string, isManual: boolean): Promise<BiometricDevice>;
    
    // Device information methods
    getSerialNumber(deviceId: string): Promise<string>;
    getFirmwareVersion(deviceId: string): Promise<string>;
    getDeviceName(deviceId: string): Promise<string>;
    
    // Device action methods
    restartDevice(deviceId: string): Promise<boolean>;
    // Time management methods
    getTime(deviceId: string): Promise<Date>;
    setTime(deviceId: string, time: Date): Promise<boolean>;

    // User methods
    registerUser(
        deviceId: string, 
        userData: BiometricUserDto,
    ): Promise<BiometricUserDto>;
    updateUser(
        deviceId: string, 
        userData: BiometricUserDto
    ): Promise<BiometricUserDto>;
    deleteUser(deviceId: string, userId: number): Promise<boolean>;
    getUserById(dto: GetBiometricUserDto): Promise<BiometricUserDto>;
    getUsers(deviceId: string): Promise<BiometricUserDto[]>;
    getUserDetails(deviceId: string): Promise<IBiometricUser[]>;

    getUserFingerprint(
        deviceId: string,
        userId: string,
        fingerId?: number
    ): Promise<IBiometricTemplate | null>;
    verifyFingerprint(deviceId: string, template: IBiometricTemplate): Promise<boolean>;
    
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

export interface AnvizRecord {
    userId: string;
}

/**
 * User information from a biometric device
 */
export interface IBiometricUser {
    /**
     * User ID in the system
     */
    userId: number

    /**
     * User's name
     */
    name: string;

    /**
     * User's password (if applicable)
     */
    password?: string;

    /**
     * Card number
     */
    cardNumber?: string;

    role: number;
    department: number;
    attendanceMode: number;
    enrolledFingerprints: number[];
    deviceCode: number;
}