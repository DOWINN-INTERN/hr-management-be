import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollItemDto, PayrollItemDto, UpdatePayrollItemDto } from "./dtos/payroll-item.dto";
import { PayrollItem } from "./entities/payroll-item.entity";
import { PayrollItemsService } from "./payroll-items.service";

export class PayrollItemsController extends createController(PayrollItem, PayrollItemsService, GetPayrollItemDto, PayrollItemDto, UpdatePayrollItemDto)
{
    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return super.deleteMany(ids, hardDelete);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return super.softDelete(id, deletedBy);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetPayrollItemDto> {
        return super.findOne(fieldsString, relations, select);
    }

    override delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }
}