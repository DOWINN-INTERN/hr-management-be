import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollDto, PayrollDto, UpdatePayrollDto } from "../dtos/payroll.dto";
import { PayrollItem } from "./entities/payroll-item.entity";
import { PayrollItemsService } from "./payroll-items.service";

export class PayrollItemsController extends createController(PayrollItem, PayrollItemsService, GetPayrollDto, PayrollDto, UpdatePayrollDto)
{
    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return super.deleteMany(ids, hardDelete);
    }

    override delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }
}