import { createController } from "@/common/factories/create-controller.factory";
import { GetPolicyDto, PolicyDto, UpdatePolicyDto } from "./dtos/policy.dto";
import { Policy } from "./entities/policy.entity";
import { PoliciesService } from "./policies.service";

export class PoliciesController extends createController(
    Policy,       // Entity name for Swagger documentation
    PoliciesService, // The service handling Policy-related operations
    GetPolicyDto,  // DTO for retrieving Policies
    PolicyDto,     // DTO for creating Policies
    UpdatePolicyDto, // DTO for updating Policies
) {
}