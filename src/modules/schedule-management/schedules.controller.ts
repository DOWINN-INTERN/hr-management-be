import { createController } from "@/common/factories/create-controller.factory";
import { GetScheduleDto, ScheduleDto, UpdateScheduleDto } from "./dtos/schedule.dto";
import { Schedule } from "./entities/schedule.entity";
import { SchedulesService } from "./schedules.service";

export class SchedulesController extends createController(Schedule, SchedulesService, GetScheduleDto, ScheduleDto, UpdateScheduleDto)
{

}