import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollDto, PayrollDto, UpdatePayrollDto } from "../dtos/payroll.dto";
import { PayrollItem } from "./entities/payroll-item.entity";
import { PayrollItemsService } from "./payroll-items.service";

export class PayrollItemsController extends createController(PayrollItem, PayrollItemsService, GetPayrollDto, PayrollDto, UpdatePayrollDto)
{

}