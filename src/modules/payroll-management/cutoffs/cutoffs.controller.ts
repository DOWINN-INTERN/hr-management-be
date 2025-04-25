import { createController } from "@/common/factories/create-controller.factory";
import { CutoffsService } from "./cutoffs.service";
import { CutoffDto, GetCutoffDto, UpdateCutoffDto } from "./dtos/cutoff.dto";
import { Cutoff } from "./entities/cutoff.entity";

export class CutoffsController extends createController(Cutoff, CutoffsService, GetCutoffDto, CutoffDto, UpdateCutoffDto)
{
    
}