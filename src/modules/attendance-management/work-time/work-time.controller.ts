import { createController } from "@/common/factories/create-controller.factory";
import { WorkTimeDto, GetWorkTimeDto, UpdateWorkTimeDto } from "./dtos/work-time.dto";
import { WorkTimeService } from "./work-time.service";
import { WorkTime } from "./entities/work-time.entity";

export class WorkTimeController extends createController<
    WorkTime,
    GetWorkTimeDto,
    WorkTimeDto,
    UpdateWorkTimeDto
>(
    'WorkTimes',       // Entity name for Swagger documentation
    WorkTimeService, // The service handling WorkTime-related operations
    GetWorkTimeDto,  // DTO for retrieving WorkTimes
    WorkTimeDto,     // DTO for creating WorkTimes
    UpdateWorkTimeDto, // DTO for updating WorkTimes
) {
}