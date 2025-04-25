import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollItemTypeDto, PayrollItemTypeDto, UpdatePayrollItemTypeDto } from "./dtos/payroll-item-type.dto";
import { PayrollItemType } from "./entities/payroll-item-type.entity";
import { PayrollItemTypesService } from "./payroll-item-types.service";

export class PayrollItemTypesController extends createController(PayrollItemType, PayrollItemTypesService, GetPayrollItemTypeDto, PayrollItemTypeDto, UpdatePayrollItemTypeDto)
{

}