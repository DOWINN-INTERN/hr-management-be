import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetScheduleChangeResponseDto, ScheduleChangeResponseDto, UpdateScheduleChangeResponseDto } from "./dtos/schedule-change-response.dto";
import { ScheduleChangeResponse } from "./entities/schedule-change-response.entity";
import { ScheduleChangeResponsesService } from "./schedule-change-responses.service";

export class ScheduleChangeResponsesController extends createController(ScheduleChangeResponse, ScheduleChangeResponsesService, GetScheduleChangeResponseDto, ScheduleChangeResponseDto, UpdateScheduleChangeResponseDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return await super.deleteMany(ids, hardDelete);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }
    
    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetScheduleChangeResponseDto> {
        return await super.findOne(fieldsString, relations, select);
    }
}
