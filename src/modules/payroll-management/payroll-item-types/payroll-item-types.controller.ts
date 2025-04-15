import { createController } from "@/common/factories/create-controller.factory";
import { PayrollItemTypeDto, GetPayrollItemTypeDto, UpdatePayrollItemTypeDto } from "./dtos/payroll-item-type.dto";
import { PayrollItemTypesService } from "./payroll-item-types.service";
import { PayrollItemType } from "./entities/payroll-item-type.entity";

export class PayrollItemTypesController extends createController<
    PayrollItemType,
    GetPayrollItemTypeDto,
    PayrollItemTypeDto,
    UpdatePayrollItemTypeDto
>(
    'PayrollItemTypes',       // Entity name for Swagger documentation
    PayrollItemTypesService, // The service handling PayrollItemType-related operations
    GetPayrollItemTypeDto,  // DTO for retrieving PayrollItemTypes
    PayrollItemTypeDto,     // DTO for creating PayrollItemTypes
    UpdatePayrollItemTypeDto, // DTO for updating PayrollItemTypes
) {
}