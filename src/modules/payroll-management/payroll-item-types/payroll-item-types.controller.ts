import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollItemTypeDto, PayrollItemTypeDto, UpdatePayrollItemTypeDto } from "./dtos/payroll-item-type.dto";
import { PayrollItemType } from "./entities/payroll-item-type.entity";
import { PayrollItemTypesService } from "./payroll-item-types.service";

export class PayrollItemTypesController extends createController(PayrollItemType, PayrollItemTypesService, GetPayrollItemTypeDto, PayrollItemTypeDto, UpdatePayrollItemTypeDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }

    override softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return super.softDelete(id, deletedBy);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetPayrollItemTypeDto> {
        return super.findOne(fieldsString, relations, select);
    }
}