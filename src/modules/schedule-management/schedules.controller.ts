import { createController } from "@/common/factories/create-controller.factory";
import { ScheduleDto, GetScheduleDto, UpdateScheduleDto } from "./dtos/schedule.dto";
import { SchedulesService } from "./schedules.service";
import { Schedule } from "./entities/schedule.entity";

export class SchedulesController extends createController<
    Schedule,
    GetScheduleDto,
    ScheduleDto,
    UpdateScheduleDto
>(
    'Schedules',       // Entity name for Swagger documentation
    SchedulesService, // The service handling Schedule-related operations
    GetScheduleDto,  // DTO for retrieving Schedules
    ScheduleDto,     // DTO for creating Schedules
    UpdateScheduleDto, // DTO for updating Schedules
) {
}