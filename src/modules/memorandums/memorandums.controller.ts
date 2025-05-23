import { createController } from "@/common/factories/create-controller.factory";
import { MemorandumDto, GetMemorandumDto, UpdateMemorandumDto } from "./dtos/memorandum.dto";
import { MemorandumsService } from "./memorandums.service";
import { Memorandum } from "./entities/memorandum.entity";

export class MemorandumsController extends createController(
    Memorandum,       // Entity name for Swagger documentation
    MemorandumsService, // The service handling Memorandum-related operations
    GetMemorandumDto,  // DTO for retrieving Memorandums
    MemorandumDto,     // DTO for creating Memorandums
    UpdateMemorandumDto, // DTO for updating Memorandums
) {
}