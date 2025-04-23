import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { DepartmentsModule } from './departments/departments.module';
import { Branch } from './entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]),
    DepartmentsModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService, DepartmentsModule],
})
export class BranchesModule {}
