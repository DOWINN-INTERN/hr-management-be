import { createController } from "@/common/factories/create-controller.factory";
import { ShiftDto, GetShiftDto, UpdateShiftDto } from "./dtos/shift.dto";
import { ShiftsService } from "./shifts.service";
import { Shift } from "./entities/shift.entity";

export class ShiftsController extends createController<
    Shift,
    GetShiftDto,
    ShiftDto,
    UpdateShiftDto
>(
    'Shifts',       // Entity name for Swagger documentation
    ShiftsService, // The service handling Shift-related operations
    GetShiftDto,  // DTO for retrieving Shifts
    ShiftDto,     // DTO for creating Shifts
    UpdateShiftDto, // DTO for updating Shifts
) {
}