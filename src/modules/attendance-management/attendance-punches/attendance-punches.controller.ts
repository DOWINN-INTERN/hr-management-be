import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { AttendancePunchesService } from "./attendance-punches.service";
import { GetAttendancePunchDto } from "./dtos/attendance-punch.dto";
import { AttendancePunches } from "./entities/attendance-punch.entity";

export class AttendancePunchesController extends createController<
    AttendancePunches,
    GetAttendancePunchDto
>(
    'AttendancePunches',       // Entity name for Swagger documentation
    AttendancePunchesService, // The service handling AttendancePunches-related operations
    GetAttendancePunchDto,  // DTO for retrieving AttendancePunches
) {
    override async create(entityDto: null, createdById: string): Promise<GetAttendancePunchDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: null, updatedById: string): Promise<GetAttendancePunchDto> {
        return await super.update(id, entityDto, updatedById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }
}