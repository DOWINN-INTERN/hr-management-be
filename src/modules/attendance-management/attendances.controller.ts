import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { AttendancesService } from "./attendances.service";
import { GetAttendanceDto, UpdateAttendanceDto } from "./dtos/attendance.dto";
import { Attendance } from "./entities/attendance.entity";

export class AttendancesController extends createController(Attendance, AttendancesService, GetAttendanceDto, undefined, UpdateAttendanceDto)
{
    override async create(entityDto: null, createdById: string): Promise<GetAttendanceDto> {
        return await super.create(entityDto, createdById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }
}