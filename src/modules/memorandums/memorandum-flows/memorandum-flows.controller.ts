import { createController } from "@/common/factories/create-controller.factory";
import { MemorandumFlowDto, GetMemorandumFlowDto, UpdateMemorandumFlowDto } from "./dtos/memorandum-flow.dto";
import { MemorandumFlowsService } from "./memorandum-flows.service";
import { MemorandumFlow } from "./entities/memorandum-flow.entity";

export class MemorandumFlowsController extends createController(
    MemorandumFlow,       // Entity name for Swagger documentation
    MemorandumFlowsService, // The service handling MemorandumFlow-related operations
    GetMemorandumFlowDto,  // DTO for retrieving MemorandumFlows
    MemorandumFlowDto,     // DTO for creating MemorandumFlows
    UpdateMemorandumFlowDto, // DTO for updating MemorandumFlows
) {
}