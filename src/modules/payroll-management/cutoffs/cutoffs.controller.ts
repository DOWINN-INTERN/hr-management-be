import { createController } from "@/common/factories/create-controller.factory";
import { CutoffDto, GetCutoffDto, UpdateCutoffDto } from "./dtos/cutoff.dto";
import { CutoffsService } from "./cutoffs.service";
import { Cutoff } from "./entities/cutoff.entity";

export class CutoffsController extends createController<
    Cutoff,
    GetCutoffDto,
    CutoffDto,
    UpdateCutoffDto
>(
    'Cutoffs',       // Entity name for Swagger documentation
    CutoffsService, // The service handling Cutoff-related operations
    GetCutoffDto,  // DTO for retrieving Cutoffs
    CutoffDto,     // DTO for creating Cutoffs
    UpdateCutoffDto, // DTO for updating Cutoffs
) {
}