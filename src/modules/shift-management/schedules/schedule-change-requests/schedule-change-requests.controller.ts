import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetScheduleChangeRequestDto, ScheduleChangeRequestDto, UpdateScheduleChangeRequestDto } from "./dtos/schedule-change-request.dto";
import { ScheduleChangeRequest } from "./entities/schedule-change-request.entity";
import { ScheduleChangeRequestsService } from "./schedule-change-requests.service";

export class ScheduleChangeRequestsController extends createController(ScheduleChangeRequest, ScheduleChangeRequestsService, GetScheduleChangeRequestDto, ScheduleChangeRequestDto, UpdateScheduleChangeRequestDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}