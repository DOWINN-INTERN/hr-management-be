import { createController } from "@/common/factories/create-controller.factory";
import { ScheduleChangeResponseDto, GetScheduleChangeResponseDto, UpdateScheduleChangeResponseDto } from "./dtos/schedule-change-response.dto";
import { ScheduleChangeResponsesService } from "./schedule-change-responses.service";
import { ScheduleChangeResponse } from "./entities/schedule-change-response.entity";

export class ScheduleChangeResponsesController extends createController<
    ScheduleChangeResponse,
    GetScheduleChangeResponseDto,
    ScheduleChangeResponseDto,
    UpdateScheduleChangeResponseDto
>(
    'ScheduleChangeResponses',       // Entity name for Swagger documentation
    ScheduleChangeResponsesService, // The service handling ScheduleChangeResponse-related operations
    GetScheduleChangeResponseDto,  // DTO for retrieving ScheduleChangeResponses
    ScheduleChangeResponseDto,     // DTO for creating ScheduleChangeResponses
    UpdateScheduleChangeResponseDto, // DTO for updating ScheduleChangeResponses
) {
}