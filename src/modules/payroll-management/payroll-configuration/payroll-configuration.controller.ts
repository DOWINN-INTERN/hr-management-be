import { createController } from "@/common/factories/create-controller.factory";
import { PayrollConfigurationDto, GetPayrollConfigurationDto, UpdatePayrollConfigurationDto } from "./dtos/payroll-configuration.dto";
import { PayrollConfigurationService } from "./payroll-configuration.service";
import { PayrollConfiguration } from "./entities/payroll-configuration.entity";

export class PayrollConfigurationController extends createController(
    PayrollConfiguration,       // Entity name for Swagger documentation
    PayrollConfigurationService, // The service handling PayrollConfiguration-related operations
    GetPayrollConfigurationDto,  // DTO for retrieving PayrollConfigurations
    PayrollConfigurationDto,     // DTO for creating PayrollConfigurations
    UpdatePayrollConfigurationDto, // DTO for updating PayrollConfigurations
) {
}