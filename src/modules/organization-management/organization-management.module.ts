import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../account-management/users/users.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './branches/departments/departments.module';
import { Organization } from './entities/organization.entity';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    UsersModule,
    BranchesModule,
    DepartmentsModule,
    RouterModule.register([
        {
            path: 'organizations',
            module: OrganizationManagementModule,
            children: [
                {
                  path: 'branches',
                  module: BranchesModule,
                  children: [
                      {
                        path: 'departments',
                        module: DepartmentsModule
                      }
                  ],
                }
            ]
        },
    ]),
  ],
  providers: [OrganizationsService],
  exports: [
      OrganizationsService,
      BranchesModule,
      DepartmentsModule,
  ],
  controllers: [OrganizationsController],
})
export class OrganizationManagementModule {}
