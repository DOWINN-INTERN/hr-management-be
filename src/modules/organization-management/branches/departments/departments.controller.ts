import { createController } from '@/common/factories/create-controller.factory';
import { DepartmentsService } from './departments.service';
import { DepartmentDto, GetDepartmentDto, UpdateDepartmentDto } from './dtos/department.dto';
import { Department } from './entities/department.entity';

export class DepartmentsController extends createController(Department, DepartmentsService, GetDepartmentDto, DepartmentDto, UpdateDepartmentDto)
{

}