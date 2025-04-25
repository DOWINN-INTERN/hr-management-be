import { createController } from "@/common/factories/create-controller.factory";
import { GetShiftDto, ShiftDto, UpdateShiftDto } from "./dtos/shift.dto";
import { Shift } from "./entities/shift.entity";
import { ShiftsService } from "./shifts.service";

export class ShiftsController extends createController(Shift, ShiftsService, GetShiftDto, ShiftDto, UpdateShiftDto)
{

}