import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetWorkTimeResponseDto, UpdateWorkTimeResponseDto, WorkTimeResponseDto } from "./dtos/work-time-response.dto";
import { WorkTimeResponse } from "./entities/work-time-response.entity";
import { WorkTimeResponsesService } from "./work-time-responses.service";

export class WorkTimeResponsesController extends createController<
    WorkTimeResponse,
    GetWorkTimeResponseDto,
    WorkTimeResponseDto,
    UpdateWorkTimeResponseDto
>(
    'WorkTimeResponses',       // Entity name for Swagger documentation
    WorkTimeResponsesService, // The service handling WorkTimeResponse-related operations
    GetWorkTimeResponseDto,  // DTO for retrieving WorkTimeResponses
    WorkTimeResponseDto,     // DTO for creating WorkTimeResponses
    UpdateWorkTimeResponseDto, // DTO for updating WorkTimeResponses
) {
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}