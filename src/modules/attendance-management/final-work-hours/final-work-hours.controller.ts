import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetFinalWorkHourDto, UpdateFinalWorkHourDto } from "./dtos/final-work-hour.dto";
import { FinalWorkHour } from "./entities/final-work-hour.entity";
import { FinalWorkHoursService } from "./final-work-hours.service";

export class FinalWorkHoursController extends createController(FinalWorkHour, FinalWorkHoursService, GetFinalWorkHourDto, undefined, UpdateFinalWorkHourDto)
{
    override async create(entityDto: null, createdById: string): Promise<GetFinalWorkHourDto> {
        return await super.create(entityDto, createdById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}