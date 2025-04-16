import { createController } from "@/common/factories/create-controller.factory";
import { AttendancePunchesService } from "./attendance-punches.service";
import { AttendancePuncheDto, GetAttendancePuncheDto, UpdateAttendancePuncheDto } from "./dtos/attendance-punche.dto";
import { AttendancePunches } from "./entities/attendance-punches.entity";

export class AttendancePunchesController extends createController<
    AttendancePunches,
    GetAttendancePuncheDto,
    AttendancePuncheDto,
    UpdateAttendancePuncheDto
>(
    'AttendancePunches',       // Entity name for Swagger documentation
    AttendancePunchesService, // The service handling AttendancePunches-related operations
    GetAttendancePuncheDto,  // DTO for retrieving AttendancePunches
    AttendancePuncheDto,     // DTO for creating AttendancePunches
    UpdateAttendancePuncheDto, // DTO for updating AttendancePunches
) {
}