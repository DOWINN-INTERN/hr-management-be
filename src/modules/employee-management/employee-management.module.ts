import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../account-management/users/users.module';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { PermissionsModule } from './roles/permissions/permissions.module';
import { RolesModule } from './roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee]),
        UsersModule,
        RolesModule,
        PermissionsModule,
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
                ],
            },
        ]),
    ],
    providers: [EmployeesService],
    exports: [
        RolesModule,
        PermissionsModule,
        EmployeesService,
    ],
    controllers: [EmployeesController],
})
export class EmployeeManagementModule {}
