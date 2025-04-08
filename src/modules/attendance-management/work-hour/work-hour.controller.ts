import { createController } from "@/common/factories/create-controller.factory";
import { WorkHourDto, GetWorkHourDto, UpdateWorkHourDto } from "./dtos/work-hour.dto";
import { WorkHourService } from "./work-hour.service";
import { WorkHour } from "./entities/work-hour.entity";

export class WorkHourController extends createController<
    WorkHour,
    GetWorkHourDto,
    WorkHourDto,
    UpdateWorkHourDto
>(
    'WorkHours',       // Entity name for Swagger documentation
    WorkHourService, // The service handling WorkHour-related operations
    GetWorkHourDto,  // DTO for retrieving WorkHours
    WorkHourDto,     // DTO for creating WorkHours
    UpdateWorkHourDto, // DTO for updating WorkHours
) {
}