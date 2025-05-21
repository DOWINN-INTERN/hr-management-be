import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { GetPayrollItemDto } from "@/modules/payroll-management/payroll-items/dtos/payroll-item.dto";
import { Body, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { EmployeeCompensationDto } from "./dtos/employee-compensation.dto";
import { EmployeePayrollItemTypeDto, GetEmployeePayrollItemTypeDto, UpdateEmployeePayrollItemTypeDto } from "./dtos/employee-payroll-item-type.dto";
import { EmployeePayrollItemTypesService } from "./employee-payroll-item-types.service";
import { EmployeePayrollItemType } from "./entities/employee-payroll-item-type.entity";

export class EmployeePayrollItemTypesController extends createController(
    EmployeePayrollItemType,       // Entity name for Swagger documentation
    EmployeePayrollItemTypesService, // The service handling EmployeePayrollItemType-related operations
    GetEmployeePayrollItemTypeDto,  // DTO for retrieving EmployeePayrollItemTypes
    EmployeePayrollItemTypeDto,     // DTO for creating EmployeePayrollItemTypes
    UpdateEmployeePayrollItemTypeDto, // DTO for updating EmployeePayrollItemTypes
) {
    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return super.deleteMany(ids, hardDelete);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }

    @Post('base-compensation/:employeeId')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Setup employee base compensation',
        description: 'Set up default compensation for an employee. Deactivates any existing base compensation items before creating a new one.'
    })
    @ApiParam({
        name: 'employeeId',
        description: 'The unique identifier of the employee',
        example: 'fa985931-6d3f-4468-a1d9-f071a3cb930c',
        type: 'uuid',
        required: true,
    })
    @ApiBody({
        description: 'Employee compensation details',
        type: EmployeeCompensationDto,
        required: true,
    })
    @ApiResponse({
        status: 201,
        description: 'Compensation has been successfully set up',
        type: GetPayrollItemDto
    })
    @ApiResponse({ status: 400, description: 'Invalid employee ID format or invalid rate type', type: GeneralResponseDto })
    @ApiResponse({ status: 404, description: 'Employee or payroll item type not found', type: GeneralResponseDto })
    @ApiResponse({ status: 500, description: 'Internal server error', type: GeneralResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: GeneralResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: GeneralResponseDto })
    async setupEmployeeCompensation(
        @Param('employeeId', ParseUUIDPipe) employeeId: string,
        @Body() dto: EmployeeCompensationDto,
        @CurrentUser('sub') userId: string,
    ): Promise<GetPayrollItemDto> {
        const compensation = await this.baseService.setupEmployeeCompensation(dto, employeeId, userId);
        return plainToInstance(GetPayrollItemDto, compensation);
    }
}