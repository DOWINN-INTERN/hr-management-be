import { AnvizAttendanceRecord } from './anviz-types';

export class AnvizProtocol {
  private static readonly STX = 0xA5;       // Start of packet
  private static readonly ETX = 0x00;       // No actual ETX in Anviz protocol
  private static readonly ACK_SUCCESS = 0x00; // Success response
  
  private sequenceNumber = 0;
  
  constructor(private deviceId: number) {}

  public createDeviceInfoCommand(): Buffer {
    // Command 0x30: Get device information
    return this.createCommand(0x30, Buffer.alloc(0));
  }

  public createGetAttendanceCommand(newOnly = false): Buffer {
    // Command 0x40: Get attendance records
    // 0x00 = All records, 0x01 = New records only
    const data = Buffer.alloc(1);
    data.writeUInt8(newOnly ? 0x01 : 0x00, 0);
    return this.createCommand(0x40, data);
  }

  public createGetAllEmployeeCommand(): Buffer {
    // Command 0x72: Get all employee information
    return this.createCommand(0x72, Buffer.alloc(0));
  }

  public createAddEmployeeCommand(employee: any): Buffer {
    // Command 0x71: Add employee
    const data = Buffer.alloc(40);
    
    // User ID (5 bytes)
    const userId = parseInt(employee.userId, 10) || 0;
    data.writeUInt32LE(userId, 0);
    data[4] = 0x00; // Reserved byte
    
    // Name (10 bytes)
    const nameBuffer = Buffer.from(employee.name || '', 'utf8');
    nameBuffer.copy(data, 5, 0, Math.min(nameBuffer.length, 10));
    
    // Card number (4 bytes)
    const cardNumber = parseInt(employee.cardNumber || '0', 10) || 0;
    data.writeUInt32LE(cardNumber, 15);
    
    // Password (6 bytes)
    const password = employee.password || '';
    const passwordBuffer = Buffer.from(password.padEnd(6, '\0').substring(0, 6), 'utf8');
    passwordBuffer.copy(data, 19);
    
    // Department (1 byte)
    data.writeUInt8(employee.department || 0, 25);
    
    // Group (1 byte)
    data.writeUInt8(employee.group || 0, 26);
    
    // Privilege (1 byte)
    data.writeUInt8(employee.privilege || 0, 27);
    
    // Other fields are reserved
    return this.createCommand(0x71, data);
  }

  public createDeleteEmployeeCommand(userId: string): Buffer {
    // Command 0x73: Delete employee
    const data = Buffer.alloc(5);
    const id = parseInt(userId, 10) || 0;
    data.writeUInt32LE(id, 0);
    data[4] = 0x00; // Reserved byte
    
    return this.createCommand(0x73, data);
  }

  public createSetTimeCommand(date: Date): Buffer {
    // Command 0x39: Set device time
    const data = Buffer.alloc(7);
    data.writeUInt16LE(date.getFullYear(), 0);
    data.writeUInt8(date.getMonth() + 1, 2);
    data.writeUInt8(date.getDate(), 3);
    data.writeUInt8(date.getHours(), 4);
    data.writeUInt8(date.getMinutes(), 5);
    data.writeUInt8(date.getSeconds(), 6);
    
    return this.createCommand(0x39, data);
  }

  public createGetTimeCommand(): Buffer {
    // Command 0x38: Get device time
    return this.createCommand(0x38, Buffer.alloc(0));
  }

  public createClearAttendanceCommand(): Buffer {
    // Command 0x42: Clear attendance records
    return this.createCommand(0x42, Buffer.alloc(0));
  }

  public createGetFingerprintCommand(userId: string, fingerId: number): Buffer {
    // Command 0x43: Get fingerprint template
    const data = Buffer.alloc(6);
    const id = parseInt(userId, 10) || 0;
    data.writeUInt32LE(id, 0);
    data.writeUInt8(fingerId & 0x0F, 4); // Finger ID (0-9)
    data.writeUInt8(0x00, 5); // Reserved
    
    return this.createCommand(0x43, data);
  }

  public createSetFingerprintCommand(userId: string, fingerId: number, template: Buffer): Buffer {
    // Command 0x44: Set fingerprint template
    const headerData = Buffer.alloc(6);
    const id = parseInt(userId, 10) || 0;
    headerData.writeUInt32LE(id, 0);
    headerData.writeUInt8(fingerId & 0x0F, 4); // Finger ID (0-9)
    headerData.writeUInt8(0x00, 5); // Reserved
    
    // Combine header and template data
    const data = Buffer.concat([headerData, template]);
    
    return this.createCommand(0x44, data);
  }

  public createRebootCommand(): Buffer {
    // Command 0x3C: Reboot device
    return this.createCommand(0x3C, Buffer.alloc(0));
  }

  public createPingCommand(): Buffer {
    // Command 0x3C: Reboot device - we use this as a ping
    // Sending a 0x30 (get device info) is also a good ping
    return this.createCommand(0x30, Buffer.alloc(0));
  }

  public createStartMonitoringCommand(): Buffer {
    // Command 0x20: Enable real-time monitoring
    const data = Buffer.alloc(1);
    data.writeUInt8(0x01, 0); // Enable (1)
    return this.createCommand(0x20, data);
  }

  public createStopMonitoringCommand(): Buffer {
    // Command 0x20: Disable real-time monitoring
    const data = Buffer.alloc(1);
    data.writeUInt8(0x00, 0); // Disable (0)
    return this.createCommand(0x20, data);
  }

  public parseDeviceInfoResponse(response: Buffer): any {
    if (!this.validateResponse(response, 0x30)) {
      throw new Error('Invalid device info response');
    }
    
    const data = this.getResponseData(response);
    
    // Format will depend on device model, this is a generic implementation
    return {
      serialNumber: data.toString('ascii', 0, 16).replace(/\0/g, ''),
      deviceModel: data.readUInt16LE(16),
      communicationVersion: data.readUInt8(18),
      firmwareVersion: `${data.readUInt8(24)}.${data.readUInt8(25)}`,
      manufactureDate: `${data.readUInt8(32)}-${data.readUInt8(33)}-${data.readUInt8(34)}`,
      deviceCapacity: {
        users: data.readUInt16LE(36),
        fingerprints: data.readUInt16LE(38),
        records: data.readUInt32LE(40),
      }
    };
  }

  public parseAttendanceRecords(response: Buffer): AnvizAttendanceRecord[] {
    if (!this.validateResponse(response, 0x40)) {
      throw new Error('Invalid attendance response');
    }
    
    const data = this.getResponseData(response);
    const recordSize = 14; // Each record is 14 bytes
    const recordCount = Math.floor(data.length / recordSize);
    const records: AnvizAttendanceRecord[] = [];
    
    for (let i = 0; i < recordCount; i++) {
      const offset = i * recordSize;
      const userId = data.readUInt32LE(offset);
      
      // Decode BCD time values
      const second = this.bcdToDec(data.readUInt8(offset + 4));
      const minute = this.bcdToDec(data.readUInt8(offset + 5));
      const hour = this.bcdToDec(data.readUInt8(offset + 6));
      const day = this.bcdToDec(data.readUInt8(offset + 7));
      const month = this.bcdToDec(data.readUInt8(offset + 8));
      const year = this.bcdToDec(data.readUInt8(offset + 9)) + 2000;
      
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      
      // Get verification method and status
      const verifyCode = data.readUInt8(offset + 10);
      const attendanceStatus = data.readUInt8(offset + 11);
      
      records.push({
        userId: userId.toString(),
        timestamp: date,
        verifyMethod: this.decodeVerifyMethod(verifyCode & 0x0F),
        attendanceType: this.decodeAttendanceType(attendanceStatus & 0x0F)
      });
    }
    
    return records;
  }

  public parseEmployeeRecords(response: Buffer): any[] {
    if (!this.validateResponse(response, 0x72)) {
      throw new Error('Invalid employee records response');
    }
    
    const data = this.getResponseData(response);
    const recordSize = 40; // Each employee record is 40 bytes
    const recordCount = Math.floor(data.length / recordSize);
    const employees = [];
    
    for (let i = 0; i < recordCount; i++) {
      const offset = i * recordSize;
      
      // Extract employee information
      const userId = data.readUInt32LE(offset).toString();
      const name = data.toString('utf8', offset + 5, offset + 15).replace(/\0/g, '').trim();
      const cardNumber = data.readUInt32LE(offset + 15).toString();
      
      // Password is stored as 6 bytes
      const password = data.toString('utf8', offset + 19, offset + 25).replace(/\0/g, '');
      
      // Single byte fields
      const department = data.readUInt8(offset + 25);
      const group = data.readUInt8(offset + 26);
      const privilege = data.readUInt8(offset + 27);
      
      employees.push({
        userId,
        name,
        cardNumber,
        password,
        department,
        group,
        privilege
      });
    }
    
    return employees;
  }

  public parseGenericResponse(response: Buffer): boolean {
    // Check if this is an ACK packet or command-specific success response
    const commandId = this.getCommandId(response);
    
    if (commandId === AnvizProtocol.ACK_SUCCESS) {
      return true;
    }
    
    // For command-specific responses, check the response data
    // In most cases, success is indicated by specific values in the data
    // This implementation is simplified for most commands
    return !this.isErrorResponse(response);
  }

  public parseTimeResponse(response: Buffer): Date {
    if (!this.validateResponse(response, 0x38)) {
      throw new Error('Invalid time response');
    }
    
    const data = this.getResponseData(response);
    
    const year = data.readUInt16LE(0);
    const month = data.readUInt8(2) - 1; // JS months are 0-based
    const day = data.readUInt8(3);
    const hour = data.readUInt8(4);
    const minute = data.readUInt8(5);
    const second = data.readUInt8(6);
    
    return new Date(year, month, day, hour, minute, second);
  }

  public parseFingerprintResponse(response: Buffer): Buffer | null {
    if (!this.validateResponse(response, 0x43)) {
      throw new Error('Invalid fingerprint response');
    }
    
    const data = this.getResponseData(response);
    
    // First 6 bytes are header info, the rest is the template
    if (data.length <= 6) {
      return null; // No template data
    }
    
    return data.slice(6);
  }

  public parsePingResponse(response: Buffer): boolean {
    // Any valid response to our ping command indicates the device is alive
    return this.validateResponseGeneric(response);
  }

  public parseRealtimeRecord(packet: Buffer): AnvizAttendanceRecord[] {
    if (!this.validateResponse(packet, 0xDF)) {
      return [];
    }
    
    const data = this.getResponseData(packet);
    
    // Real-time record format is same as attendance record
    const recordSize = 14;
    const recordCount = Math.floor(data.length / recordSize);
    const records: AnvizAttendanceRecord[] = [];
    
    for (let i = 0; i < recordCount; i++) {
      const offset = i * recordSize;
      const userId = data.readUInt32LE(offset);
      
      // Decode BCD time values
      const second = this.bcdToDec(data.readUInt8(offset + 4));
      const minute = this.bcdToDec(data.readUInt8(offset + 5));
      const hour = this.bcdToDec(data.readUInt8(offset + 6));
      const day = this.bcdToDec(data.readUInt8(offset + 7));
      const month = this.bcdToDec(data.readUInt8(offset + 8));
      const year = this.bcdToDec(data.readUInt8(offset + 9)) + 2000;
      
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      
      // Get verification method and status
      const verifyCode = data.readUInt8(offset + 10);
      const attendanceStatus = data.readUInt8(offset + 11);
      
      records.push({
        userId: userId.toString(),
        timestamp: date,
        verifyMethod: this.decodeVerifyMethod(verifyCode & 0x0F),
        attendanceType: this.decodeAttendanceType(attendanceStatus & 0x0F)
      });
    }
    
    return records;
  }

  public extractPacket(buffer: Buffer): { packet: Buffer | null, remainingData: Buffer } {
    if (buffer.length < 8) { // Minimum packet size: STX + Device ID (4) + CMD + LEN (2) = 8 bytes
      return { packet: null, remainingData: buffer };
    }
    
    // Look for start of packet marker
    const stxIndex = buffer.indexOf(AnvizProtocol.STX);
    if (stxIndex === -1) {
      // No start marker, clear buffer
      return { packet: null, remainingData: Buffer.alloc(0) };
    }
    
    // If start marker isn't at beginning, discard preceding data
    if (stxIndex > 0) {
      buffer = buffer.slice(stxIndex);
      if (buffer.length < 8) {
        return { packet: null, remainingData: buffer };
      }
    }
    
    // Get packet length from bytes 7-8 (big endian)
    const dataLength = buffer.readUInt16BE(6);
    
    // Calculate total packet size: STX(1) + DeviceID(4) + CMD(1) + LEN(2) + DATA(dataLength) + CRC16(2)
    const totalLength = 1 + 4 + 1 + 2 + dataLength + 2;
    
    if (buffer.length < totalLength) {
      // Not enough data for a complete packet
      return { packet: null, remainingData: buffer };
    }
    
    // Extract packet and validate CRC
    const packet = buffer.slice(0, totalLength);
    const receivedCRC = packet.readUInt16LE(totalLength - 2);
    const calculatedCRC = this.calculateCRC16(packet.slice(0, totalLength - 2));
    
    if (receivedCRC !== calculatedCRC) {
      // CRC mismatch, try to find next STX
      const nextStxIndex = buffer.indexOf(AnvizProtocol.STX, 1);
      if (nextStxIndex === -1) {
        // No more start markers, clear buffer
        return { packet: null, remainingData: Buffer.alloc(0) };
      }
      
      // Skip to next potential packet
      return this.extractPacket(buffer.slice(nextStxIndex));
    }
    
    // Extract valid packet and remaining data
    const remainingData = buffer.slice(totalLength);
    
    return { packet, remainingData };
  }

  public getSequence(packet: Buffer): number {
    if (packet.length < 6) {
      return 0;
    }
    
    // In Anviz protocol, there's no dedicated sequence field
    // We'll use the last byte of device ID which we repurpose for sequence
    return packet[5];
  }

  public getCommandId(packet: Buffer): number {
    if (packet.length < 6) {
      return 0;
    }
    
    return packet[5]; // Command ID is at position 5
  }

  public getErrorCode(packet: Buffer): number {
    // In responses, the return value/error code is usually at position 6
    if (packet.length < 7) {
      return -1;
    }
    
    return packet[6];
  }

  public isErrorResponse(packet: Buffer): boolean {
    // Check return value byte (position 6)
    if (packet.length < 7) {
      return true;
    }
    
    return packet[6] !== 0x00; // Non-zero return value indicates error
  }

  public validateResponse(response: Buffer, expectedCommand: number): boolean {
    if (!this.validateResponseGeneric(response)) {
      return false;
    }
    
    // For specific command responses, verify command ID matches
    // Response command ID should be original command ID + 0x80
    const commandId = this.getCommandId(response);
    return commandId === (expectedCommand + 0x80);
  }

  public validateResponseGeneric(response: Buffer): boolean {
    // Check minimum size (STX + DeviceID + CMD + RET + LEN + CRC)
    if (response.length < 10) {
      return false;
    }
    
    // Check STX marker
    if (response[0] !== AnvizProtocol.STX) {
      return false;
    }
    
    // Check CRC
    const dataLength = response.readUInt16BE(7);
    const totalLength = 10 + dataLength; // STX + DeviceID(4) + CMD + RET + LEN(2) + DATA + CRC(2)
    
    if (response.length < totalLength) {
      return false;
    }
    
    const receivedCRC = response.readUInt16LE(totalLength - 2);
    const calculatedCRC = this.calculateCRC16(response.slice(0, totalLength - 2));
    
    return receivedCRC === calculatedCRC;
  }

  public getResponseData(response: Buffer): Buffer {
    // Skip header: STX(1) + DeviceID(4) + CMD(1) + RET(1) + LEN(2) = 9 bytes
    // Response data starts at position 9
    // Remove trailer: CRC16(2) = 2 bytes from end
    const dataLength = response.readUInt16BE(7);
    return response.slice(9, 9 + dataLength);
  }

  private createCommand(commandId: number, data: Buffer): Buffer {
    // Increment sequence number
    this.sequenceNumber = (this.sequenceNumber + 1) % 256;
    
    // Create the command structure
    const packet = Buffer.alloc(1 + 4 + 1 + 2 + data.length + 2);
    
    let offset = 0;
    packet[offset++] = AnvizProtocol.STX;
    
    // Device ID (4 bytes in big endian)
    packet.writeUInt32BE(this.deviceId, offset);
    offset += 4;
    
    // Command ID
    packet[offset++] = commandId;
    
    // Data length (2 bytes, big endian)
    packet.writeUInt16BE(data.length, offset);
    offset += 2;
    
    // Copy data if any
    if (data.length > 0) {
      data.copy(packet, offset);
      offset += data.length;
    }
    
    // Store sequence number in first byte
    packet[1] = this.sequenceNumber;
    
    // Calculate CRC16
    const crc = this.calculateCRC16(packet.slice(0, offset));
    
    // CRC16 (2 bytes, little endian)
    packet.writeUInt16LE(crc, offset);
    
    return packet;
  }
  
  private calculateCRC16(data: Buffer): number {
    // Standard CRC16-CCITT calculation
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
      crc = ((crc >> 8) | (crc << 8)) & 0xFFFF;
      crc ^= data[i];
      crc ^= ((crc & 0xFF) >> 4) & 0xFFFF;
      crc ^= ((crc << 8) << 4) & 0xFFFF;
      crc ^= (((crc & 0xFF) << 4) << 1) & 0xFFFF;
    }
    return crc & 0xFFFF;
  }

  private bcdToDec(bcd: number): number {
    return ((bcd >> 4) * 10) + (bcd & 0x0F);
  }

  private decodeVerifyMethod(code: number): string {
    switch (code) {
      case 0: return 'NONE';
      case 1: return 'FINGER';
      case 2: return 'PASSWORD';
      case 3: return 'CARD';
      case 4: return 'FACE';
      case 5: return 'PALM';
      default: return 'UNKNOWN';
    }
  }

  private decodeAttendanceType(code: number): string {
    switch (code) {
      case 0: return 'CHECK_IN';
      case 1: return 'CHECK_OUT';
      case 2: return 'BREAK_OUT';
      case 3: return 'BREAK_IN';
      case 4: return 'OVERTIME_IN';
      case 5: return 'OVERTIME_OUT';
      default: return 'UNKNOWN';
    }
  }
}