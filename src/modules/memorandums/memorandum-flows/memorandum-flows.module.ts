import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { MemorandumFlowsController } from './memorandum-flows.controller';
import { MemorandumFlowsService } from './memorandum-flows.service';
import { MemorandumFlow } from './entities/memorandum-flow.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumFlow]),

    ],
    providers: [MemorandumFlowsService],
    exports: [MemorandumFlowsService],
    controllers: [MemorandumFlowsController],
})
export class MemorandumFlowsModule {}