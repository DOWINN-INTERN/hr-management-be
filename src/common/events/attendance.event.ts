import { AttendanceRecord } from "@/modules/biometrics/interfaces/biometric.interface";

export const ATTENDANCE_EVENTS = {
  ATTENDANCE_RECORDED: 'attendance.recorded'
};
  
export class AttendanceEvent {
  constructor(
    public readonly attendances: AttendanceRecord[],
    public readonly deviceId: string,
  ) {}
}