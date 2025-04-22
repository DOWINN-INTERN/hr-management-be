import { createController } from "@/common/factories/create-controller.factory";
import { GetFinalWorkHourDto, UpdateFinalWorkHourDto } from "./dtos/final-work-hour.dto";
import { FinalWorkHour } from "./entities/final-work-hour.entity";
import { FinalWorkHoursService } from "./final-work-hours.service";

export class FinalWorkHoursController extends createController<
    FinalWorkHour,
    GetFinalWorkHourDto,
    null,
    UpdateFinalWorkHourDto
>(
    'FinalWorkHours',       // Entity name for Swagger documentation
    FinalWorkHoursService, // The service handling FinalWorkHour-related operations
    GetFinalWorkHourDto,  // DTO for retrieving FinalWorkHours
    null,     // DTO for creating FinalWorkHours
    UpdateFinalWorkHourDto, // DTO for updating FinalWorkHours
) {
    override async create(entityDto: null, createdById: string): Promise<GetFinalWorkHourDto> {
        return await super.create(entityDto, createdById);
    }
}