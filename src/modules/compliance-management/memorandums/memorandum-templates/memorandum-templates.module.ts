import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorandumTemplate } from './entities/memorandum-template.entity';
import { MemorandumTemplatesController } from './memorandum-templates.controller';
import { MemorandumTemplatesService } from './memorandum-templates.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumTemplate]),
    ],
    providers: [MemorandumTemplatesService],
    exports: [MemorandumTemplatesService],
    controllers: [MemorandumTemplatesController],
})
export class MemorandumTemplatesModule {}