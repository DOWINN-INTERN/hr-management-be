import { BaseController } from "@/common/controllers/base.controller";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmployeeDto, GetEmployeeDto } from "./dtos/employee.dto";
import { EmployeesService } from "./employees.service";
import { Employee } from "./entities/employee.entity";
import { createPermissions } from "./roles/permissions/utils/create-permissions.utils";

// Controller permissions
export const EmployeesPermission = createPermissions('employees');
const { Read, Create, Update, Delete } = EmployeesPermission;

@ApiTags('Employees')
@Controller()
export class EmployeesController extends BaseController<Employee, GetEmployeeDto, EmployeeDto> {
    constructor(private readonly employeesService: EmployeesService) {
        super(employeesService, GetEmployeeDto);
    }
}
