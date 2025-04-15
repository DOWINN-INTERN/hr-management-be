import { UsersModule } from '@/modules/account-management/users/users.module';
import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Group]),
        UsersModule,
        EmployeeManagementModule,
    ],
    providers: [GroupsService],
    exports: [GroupsService],
    controllers: [GroupsController],
})
export class GroupsModule {}