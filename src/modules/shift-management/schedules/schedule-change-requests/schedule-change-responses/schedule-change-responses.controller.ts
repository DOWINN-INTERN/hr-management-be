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
}