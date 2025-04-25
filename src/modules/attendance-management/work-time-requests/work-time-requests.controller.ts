import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetWorkTimeRequestDto, UpdateWorkTimeRequestDto, WorkTimeRequestDto } from "./dtos/work-time-request.dto";
import { WorkTimeRequest } from "./entities/work-time-request.entity";
import { WorkTimeRequestsService } from "./work-time-requests.service";

export class WorkTimeRequestsController extends createController(WorkTimeRequest, WorkTimeRequestsService, GetWorkTimeRequestDto, WorkTimeRequestDto, UpdateWorkTimeRequestDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}