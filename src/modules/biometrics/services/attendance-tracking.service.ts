// import { AttendancePunch } from '@/modules/attendance-management/attendance-punches/entities/attendance-punch.entity';
// import { Injectable, Logger } from '@nestjs/common';
// import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { BiometricDevice } from '../entities/biometric-device.entity';
// import { AttendanceRecord } from '../interfaces/biometric.interface';

// @Injectable()
// export class AttendanceTrackingService {
//   private readonly logger = new Logger(AttendanceTrackingService.name);

//   constructor(
//     @InjectRepository(AttendancePunch)
//     private readonly attendancePunchRepository: Repository<AttendancePunch>,
//     @InjectRepository(BiometricDevice)
//     private readonly deviceRepository: Repository<BiometricDevice>,
//     private readonly eventEmitter: EventEmitter2
//   ) {}

//   /**
//    * Handle attendance events from any biometric device
//    * @param record Attendance record from device
//    */
//   @OnEvent('biometric.attendance')
//   async handleAttendanceEvent(record: AttendanceRecord): Promise<void> {
//     try {
//       // Get device information
//       const device = await this.deviceRepository.findOneBy({ id: record.deviceId });
      
//       if (!device) {
//         this.logger.warn(`Received attendance record from unknown device ID: ${record.deviceId}`);
//         return;
//       }

//     //   // Create and save attendance punch
//     //   const attendancePunch = this.attendancePunchRepository.create({
//     //     punchType: this.mapAttendanceType(record.type),
//     //     biometricDevice: device,
//     //     // Removed verificationMode as it doesn't exist in the entity
//     //     data: JSON.stringify(record)
//     //   });

//     //   const savedPunch = await this.attendancePunchRepository.save(attendancePunch);
      
//     //   this.logger.log(`Recorded attendance for user ${record.userId} from device ${device.serialNumber || device.id}`);
      
//     //   // Emit event for other services to react to
//     //   this.eventEmitter.emit('attendance.recorded', {
//     //     ...savedPunch,
//     //     deviceInfo: {
//     //       id: device.id,
//     //       ipAddress: device.ipAddress,
//     //       model: device.model,
//     //       serialNumber: device.serialNumber,
//     //       provider: device.provider
//     //     }
//     //   });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       this.logger.error(`Error recording attendance: ${errorMessage}`);
//     }
//   }

//   /**
//    * Map device-specific attendance type codes to standardized types
//    * @param attendanceType Type code from device
//    * @returns Standardized attendance type string
//    */
//   private mapAttendanceType(attendanceType: number): string {
//     switch (attendanceType) {
//       case 0: return 'CHECK_IN';
//       case 1: return 'CHECK_OUT';
//       case 2: return 'BREAK_OUT';
//       case 3: return 'BREAK_IN';
//       case 4: return 'OVERTIME_IN';
//       case 5: return 'OVERTIME_OUT';
//       default: return 'CHECK_IN';
//     }
//   }
// }