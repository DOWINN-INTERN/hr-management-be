import { Attendance } from "@/modules/attendance-management/entities/attendance.entity";
import { AttendanceRecord } from "@/modules/biometrics/interfaces/biometric.interface";

export const ATTENDANCE_EVENTS = {
  ATTENDANCE_RECORDED: 'attendance.recorded',
  ATTENDANCE_PROCESSED: 'attendance.processed',
  FINAL_WORK_HOURS_CALCULATION: 'attendance.final_work_hours_calculation',
  RECALCULATE_FINAL_WORK_HOURS: 'attendance.recalculate_final_work_hours',
};
  
export class AttendanceRecordedEvent {
  constructor(
    public readonly attendances: AttendanceRecord[],
    public readonly deviceId: string,
  ) {}
}

export class AttendanceProcessedEvent {
  constructor(
    public readonly attendances: Attendance[],
    public readonly processedBy: string = 'SYSTEM',
  ) {}
}

export class FinalWorkHoursCalculationEvent {
  constructor(
    public readonly attendanceIds: string[],
    public readonly batchId: string,
    public readonly processedBy: string
  ) {}
}

export class RecalculateFinalWorkHoursEvent {
  constructor(
    public readonly cutoffId: string,
    public readonly recalculatedBy: string
  ) {}
}