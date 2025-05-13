import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePayrollItemTypesModule } from './employee-payroll-item-types/employee-payroll-item-types.module';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { PermissionsModule } from './roles/permissions/permissions.module';
import { RolesModule } from './roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee]),
        RolesModule,
        RouterModule.register([
            {
                path: 'employees',
                module: EmployeeManagementModule,
                children: [
                    {
                        path: 'roles',
                        module: RolesModule,
                        children: [
                            {
                                path: 'permissions',
                                module: PermissionsModule,
                            }
                        ]
                    },
                    {
                        path: 'payroll-item-types',
                        module: EmployeePayrollItemTypesModule
                    }
                ]
            }
        ]),
        RolesModule,
        EmployeePayrollItemTypesModule,
    ],
    providers: [EmployeesService],
    exports: [
        RolesModule,
        EmployeesService,
        EmployeePayrollItemTypesModule,
    ],
    controllers: [EmployeesController],
})
export class EmployeeManagementModule {}
