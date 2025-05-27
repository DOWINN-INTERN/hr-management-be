import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { MemorandumsController } from './memorandums.controller';
import { MemorandumsService } from './memorandums.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Memorandum]),
    ],
    providers: [MemorandumsService],
    exports: [
        MemorandumsService,
    ],
    controllers: [MemorandumsController],
})
export class MemorandumsModule {}