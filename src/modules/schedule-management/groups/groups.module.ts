import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Group]),
        UsersModule,

    ],
    providers: [GroupsService],
    exports: [GroupsService],
    controllers: [GroupsController],
})
export class GroupsModule {}