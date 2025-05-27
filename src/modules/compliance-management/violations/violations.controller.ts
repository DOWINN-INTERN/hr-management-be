import { createController } from "@/common/factories/create-controller.factory";
import { ViolationDto, GetViolationDto, UpdateViolationDto } from "./dtos/violation.dto";
import { ViolationsService } from "./violations.service";
import { Violation } from "./entities/violation.entity";

export class ViolationsController extends createController(
    Violation,       // Entity name for Swagger documentation
    ViolationsService, // The service handling Violation-related operations
    GetViolationDto,  // DTO for retrieving Violations
    ViolationDto,     // DTO for creating Violations
    UpdateViolationDto, // DTO for updating Violations
) {
}