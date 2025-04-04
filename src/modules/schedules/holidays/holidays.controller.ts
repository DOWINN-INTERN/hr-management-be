import { createController } from "@/common/factories/create-controller.factory";
import { HolidayDto, GetHolidayDto, UpdateHolidayDto } from "./dtos/holiday.dto";
import { HolidaysService } from "./holidays.service";
import { Holiday } from "./entities/holiday.entity";

export class HolidaysController extends createController<
    Holiday,
    GetHolidayDto,
    HolidayDto,
    UpdateHolidayDto
>(
    'Holidays',       // Entity name for Swagger documentation
    HolidaysService, // The service handling Holiday-related operations
    GetHolidayDto,  // DTO for retrieving Holidays
    HolidayDto,     // DTO for creating Holidays
    UpdateHolidayDto, // DTO for updating Holidays
) {
}