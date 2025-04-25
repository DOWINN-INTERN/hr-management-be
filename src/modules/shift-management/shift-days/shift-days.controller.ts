import { createController } from "@/common/factories/create-controller.factory";
import { GetShiftDayDto, ShiftDayDto, UpdateShiftDayDto } from "./dtos/shift-day.dto";
import { ShiftDay } from "./entities/shift-day.entity";
import { ShiftDaysService } from "./shift-days.service";

export class ShiftDaysController extends createController(
    ShiftDay,       // Entity name for Swagger documentation
    ShiftDaysService, // The service handling ShiftDay-related operations
    GetShiftDayDto,  // DTO for retrieving ShiftDays
    ShiftDayDto,     // DTO for creating ShiftDays
    UpdateShiftDayDto, // DTO for updating ShiftDays
) {
}