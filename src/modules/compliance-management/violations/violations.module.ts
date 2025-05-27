import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';
import { Violation } from './entities/violation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Violation]),

    ],
    providers: [ViolationsService],
    exports: [ViolationsService],
    controllers: [ViolationsController],
})
export class ViolationsModule {}