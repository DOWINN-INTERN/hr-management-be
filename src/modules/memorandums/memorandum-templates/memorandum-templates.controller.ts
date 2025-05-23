import { createController } from "@/common/factories/create-controller.factory";
import { MemorandumTemplateDto, GetMemorandumTemplateDto, UpdateMemorandumTemplateDto } from "./dtos/memorandum-template.dto";
import { MemorandumTemplatesService } from "./memorandum-templates.service";
import { MemorandumTemplate } from "./entities/memorandum-template.entity";

export class MemorandumTemplatesController extends createController(
    MemorandumTemplate,       // Entity name for Swagger documentation
    MemorandumTemplatesService, // The service handling MemorandumTemplate-related operations
    GetMemorandumTemplateDto,  // DTO for retrieving MemorandumTemplates
    MemorandumTemplateDto,     // DTO for creating MemorandumTemplates
    UpdateMemorandumTemplateDto, // DTO for updating MemorandumTemplates
) {
}