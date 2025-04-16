import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { AttendancesService } from "./attendances.service";
import { AttendanceDto, GetAttendanceDto, UpdateAttendanceDto } from "./dtos/attendance.dto";
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
    override async create(entityDto: AttendanceDto, createdById: string): Promise<GetAttendanceDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: UpdateAttendanceDto, updatedById: string): Promise<GetAttendanceDto> {
        return await super.update(id, entityDto, updatedById);
    }

    override async delete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.delete(id, deletedBy);
    }
    
    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }
}