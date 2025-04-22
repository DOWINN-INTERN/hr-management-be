import { createController } from "@/common/factories/create-controller.factory";
import { GetWorkTimeRequestDto, UpdateWorkTimeRequestDto, WorkTimeRequestDto } from "./dtos/work-time-request.dto";
import { WorkTimeRequest } from "./entities/work-time-request.entity";
import { WorkTimeRequestsService } from "./work-time-requests.service";

export class WorkTimeRequestsController extends createController<
    WorkTimeRequest,
    GetWorkTimeRequestDto,
    WorkTimeRequestDto,
    UpdateWorkTimeRequestDto
>(
    'WorkTimeRequests',       // Entity name for Swagger documentation
    WorkTimeRequestsService, // The service handling WorkTimeRequest-related operations
    GetWorkTimeRequestDto,  // DTO for retrieving WorkTimeRequests
    WorkTimeRequestDto,     // DTO for creating WorkTimeRequests
    UpdateWorkTimeRequestDto, // DTO for updating WorkTimeRequests
) {
    
}