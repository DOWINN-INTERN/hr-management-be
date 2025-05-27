import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorandumFlow } from './entities/memorandum-flow.entity';
import { MemorandumFlowsController } from './memorandum-flows.controller';
import { MemorandumFlowsService } from './memorandum-flows.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumFlow]),
    ],
    providers: [MemorandumFlowsService],
    exports: [MemorandumFlowsService],
    controllers: [MemorandumFlowsController],
})
export class MemorandumFlowsModule {}