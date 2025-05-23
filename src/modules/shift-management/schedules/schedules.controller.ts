import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetScheduleDto, ScheduleDto, UpdateScheduleDto } from "./dtos/schedule.dto";
import { Schedule } from "./entities/schedule.entity";
import { SchedulesService } from "./schedules.service";

export class SchedulesController extends createController(Schedule, SchedulesService, GetScheduleDto, ScheduleDto, UpdateScheduleDto)
{
    override async create(entityDto: ScheduleDto, createdById: string): Promise<GetScheduleDto> {
        return super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: ScheduleDto, updatedById: string): Promise<GetScheduleDto> {
        return super.update(id, entityDto, updatedById);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetScheduleDto> {
        return super.findOne(fieldsString, relations, select);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }
}