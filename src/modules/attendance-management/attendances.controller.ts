import { createController } from "@/common/factories/create-controller.factory";
import { AttendanceDto, GetAttendanceDto, UpdateAttendanceDto } from "./dtos/attendance.dto";
import { AttendancesService } from "./attendances.service";
import { Attendance } from "./entities/attendance.entity";

export class AttendancesController extends createController<
    Attendance,
    GetAttendanceDto,
    AttendanceDto,
    UpdateAttendanceDto
>(
    'Attendances',       // Entity name for Swagger documentation
    AttendancesService, // The service handling Attendance-related operations
    GetAttendanceDto,  // DTO for retrieving Attendances
    AttendanceDto,     // DTO for creating Attendances
    UpdateAttendanceDto, // DTO for updating Attendances
) {
}