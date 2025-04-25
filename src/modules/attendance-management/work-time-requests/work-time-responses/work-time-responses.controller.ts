import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetWorkTimeResponseDto, UpdateWorkTimeResponseDto, WorkTimeResponseDto } from "./dtos/work-time-response.dto";
import { WorkTimeResponse } from "./entities/work-time-response.entity";
import { WorkTimeResponsesService } from "./work-time-responses.service";

export class WorkTimeResponsesController extends createController(WorkTimeResponse, WorkTimeResponsesService, GetWorkTimeResponseDto, WorkTimeResponseDto, UpdateWorkTimeResponseDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}