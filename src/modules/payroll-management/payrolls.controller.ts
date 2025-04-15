import { createController } from "@/common/factories/create-controller.factory";
import { PayrollDto, GetPayrollDto, UpdatePayrollDto } from "./dtos/payroll.dto";
import { PayrollsService } from "./payrolls.service";
import { Payroll } from "./entities/payroll.entity";

export class PayrollsController extends createController<
    Payroll,
    GetPayrollDto,
    PayrollDto,
    UpdatePayrollDto
>(
    'Payrolls',       // Entity name for Swagger documentation
    PayrollsService, // The service handling Payroll-related operations
    GetPayrollDto,  // DTO for retrieving Payrolls
    PayrollDto,     // DTO for creating Payrolls
    UpdatePayrollDto, // DTO for updating Payrolls
) {
}