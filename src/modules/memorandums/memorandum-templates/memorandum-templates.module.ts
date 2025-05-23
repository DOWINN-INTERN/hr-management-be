import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { MemorandumTemplatesController } from './memorandum-templates.controller';
import { MemorandumTemplatesService } from './memorandum-templates.service';
import { MemorandumTemplate } from './entities/memorandum-template.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumTemplate]),

    ],
    providers: [MemorandumTemplatesService],
    exports: [MemorandumTemplatesService],
    controllers: [MemorandumTemplatesController],
})
export class MemorandumTemplatesModule {}