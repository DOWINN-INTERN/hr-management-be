import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { Rule } from './entities/rule.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rule]),

    ],
    providers: [RulesService],
    exports: [RulesService],
    controllers: [RulesController],
})
export class RulesModule {}