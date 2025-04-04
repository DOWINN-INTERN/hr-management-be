import { createController } from "@/common/factories/create-controller.factory";
import { EmployeeDto, GetEmployeeDto, UpdateEmployeeDto } from "./dtos/employee.dto";
import { EmployeesService } from "./employees.service";
import { Employee } from "./entities/employee.entity";

export class EmployeesController extends createController<
    Employee,
    GetEmployeeDto,
    EmployeeDto,
    UpdateEmployeeDto
>(
    'Employees',       // Entity name for Swagger documentation
    EmployeesService, // The service handling Employee-related operations
    GetEmployeeDto,  // DTO for retrieving Employees
    EmployeeDto,     // DTO for creating Employees
    UpdateEmployeeDto, // DTO for updating Employees
) {

}