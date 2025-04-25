import { createController } from "@/common/factories/create-controller.factory";
import { EmployeeDto, GetEmployeeDto, UpdateEmployeeDto } from "./dtos/employee.dto";
import { EmployeesService } from "./employees.service";
import { Employee } from "./entities/employee.entity";

export class EmployeesController extends createController(Employee, EmployeesService, GetEmployeeDto, EmployeeDto, UpdateEmployeeDto)
{

}