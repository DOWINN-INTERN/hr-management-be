import { createController } from '@/common/factories/create-controller.factory';
import { DepartmentsService } from './departments.service';
import { DepartmentDto, GetDepartmentDto, UpdateDepartmentDto } from './dtos/department.dto';
import { Department } from './entities/department.entity';

export class DepartmentsController extends createController<
    Department,
    GetDepartmentDto,
    DepartmentDto,
    UpdateDepartmentDto
>(
    'Departments', // Entity name for Swagger documentation
    DepartmentsService, // The service handling Department-related operations
    GetDepartmentDto, // DTO for retrieving departments
    DepartmentDto, // DTO for creating departments
    UpdateDepartmentDto // DTO for updating departments
) {

}