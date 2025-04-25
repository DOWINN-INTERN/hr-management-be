import { createController } from "@/common/factories/create-controller.factory";
import { GetHolidayDto, HolidayDto, UpdateHolidayDto } from "./dtos/holiday.dto";
import { Holiday } from "./entities/holiday.entity";
import { HolidaysService } from "./holidays.service";

export class HolidaysController extends createController(Holiday, HolidaysService, GetHolidayDto, HolidayDto, UpdateHolidayDto)
{

}