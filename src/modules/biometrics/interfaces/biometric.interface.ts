export interface IBiometricDevice {
    id: string;
    ipAddress: string;
    port: number;
    model?: string;
    serialNumber?: string;
    isConnected: boolean;
    firmware?: string;
    platform?: string;
    deviceVersion?: string;
    os?: string;
}

export interface IBiometricTemplate {
    id: string;
    userId: string;
    fingerId: number;
    template: Buffer | string;
    provider: string;
}

export interface IBiometricService {
    // Core device management (required)
    connect(ipAddress: string, port: number): Promise<IBiometricDevice | null>;
    disconnect(deviceId: string): Promise<boolean>;
    getConnectedDevices(): Promise<IBiometricDevice[]>;
    
    // Device information methods
    getDeviceInfo(deviceId: string): Promise<Record<string, any>>;
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
    
    // Real-time monitoring methods
    startRealTimeMonitoring(deviceId: string, callback: (record: AttendanceRecord) => void): string;
    stopRealTimeMonitoring(monitoringId: string): boolean;
    
    // Door control
    unlockDoor(deviceId: string): Promise<boolean>;
    
    // Command execution
    executeCommand(deviceId: string, command: string, data?: string): Promise<any>;
}

  /**
 * Represents a standardized attendance record from a biometric device
 */
export interface AttendanceRecord {
    /**
     * User ID associated with the attendance record
     */
    userId: string;
    
    /**
     * Date and time when the attendance was recorded
     */
    timestamp: Date;
    
    /**
     * Type of attendance event
     * Common values:
     * - 0: Check-in
     * - 1: Check-out
     * - 2: Break-out
     * - 3: Break-in
     * - 4: Overtime-in
     * - 5: Overtime-out
     */
    type: number;
    
    /**
     * ID of the device that recorded this attendance
     */
    deviceId: string;
    
    /**
     * Optional verification mode used (fingerprint, card, password, etc.)
     * The meaning of values depends on the specific device model
     */
    verificationMode?: number;
    
    /**
     * Optional status code returned by the device
     */
    status?: number;
    
    /**
     * Optional workcode associated with the attendance record
     */
    workcode?: number;
    
    /**
     * Flag indicating if this record has been synchronized with central system
     */
    isSynced?: boolean;
    
    /**
     * When the record was retrieved from the device
     */
    retrievedAt?: Date;
    
    /**
     * Additional custom data associated with the attendance record
     */
    data?: Record<string, any>;
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