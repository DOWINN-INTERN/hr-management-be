import { createController } from "@/common/factories/create-controller.factory";
import { ScheduleChangeRequestDto, GetScheduleChangeRequestDto, UpdateScheduleChangeRequestDto } from "./dtos/schedule-change-request.dto";
import { ScheduleChangeRequestsService } from "./schedule-change-requests.service";
import { ScheduleChangeRequest } from "./entities/schedule-change-request.entity";

export class ScheduleChangeRequestsController extends createController<
    ScheduleChangeRequest,
    GetScheduleChangeRequestDto,
    ScheduleChangeRequestDto,
    UpdateScheduleChangeRequestDto
>(
    'ScheduleChangeRequests',       // Entity name for Swagger documentation
    ScheduleChangeRequestsService, // The service handling ScheduleChangeRequest-related operations
    GetScheduleChangeRequestDto,  // DTO for retrieving ScheduleChangeRequests
    ScheduleChangeRequestDto,     // DTO for creating ScheduleChangeRequests
    UpdateScheduleChangeRequestDto, // DTO for updating ScheduleChangeRequests
) {
}