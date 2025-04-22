import { createController } from "@/common/factories/create-controller.factory";
import { AttendancesService } from "./attendances.service";
import { GetAttendanceDto, UpdateAttendanceDto } from "./dtos/attendance.dto";
import { Attendance } from "./entities/attendance.entity";

export class AttendancesController extends createController<
    Attendance,
    GetAttendanceDto,
    null,
    UpdateAttendanceDto
>(
    'Attendances',       // Entity name for Swagger documentation
    AttendancesService, // The service handling Attendance-related operations
    GetAttendanceDto,  // DTO for retrieving Attendances
    null,
    UpdateAttendanceDto, // DTO for updating Attendances
) {
    override async create(entityDto: null, createdById: string): Promise<GetAttendanceDto> {
        return await super.create(entityDto, createdById);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }
}