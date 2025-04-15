import { createController } from "@/common/factories/create-controller.factory";
import { PayrollItemDto, GetPayrollItemDto, UpdatePayrollItemDto } from "./dtos/payroll-item.dto";
import { PayrollItemsService } from "./payroll-items.service";
import { PayrollItem } from "./entities/payroll-item.entity";

export class PayrollItemsController extends createController<
    PayrollItem,
    GetPayrollItemDto,
    PayrollItemDto,
    UpdatePayrollItemDto
>(
    'PayrollItems',       // Entity name for Swagger documentation
    PayrollItemsService, // The service handling PayrollItem-related operations
    GetPayrollItemDto,  // DTO for retrieving PayrollItems
    PayrollItemDto,     // DTO for creating PayrollItems
    UpdatePayrollItemDto, // DTO for updating PayrollItems
) {
}