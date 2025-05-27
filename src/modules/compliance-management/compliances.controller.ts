import { createController } from "@/common/factories/create-controller.factory";
import { ComplianceDto, GetComplianceDto, UpdateComplianceDto } from "./dtos/compliance.dto";
import { CompliancesService } from "./compliances.service";
import { Compliance } from "./entities/compliance.entity";

export class CompliancesController extends createController(
    Compliance,       // Entity name for Swagger documentation
    CompliancesService, // The service handling Compliance-related operations
    GetComplianceDto,  // DTO for retrieving Compliances
    ComplianceDto,     // DTO for creating Compliances
    UpdateComplianceDto, // DTO for updating Compliances
) {
}