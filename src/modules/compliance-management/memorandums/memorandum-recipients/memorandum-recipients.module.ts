import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorandumRecipient } from './entities/memorandum-recipient.entity';
import { MemorandumRecipientsController } from './memorandum-recipients.controller';
import { MemorandumRecipientsService } from './memorandum-recipients.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumRecipient]),
    ],
    providers: [MemorandumRecipientsService],
    exports: [MemorandumRecipientsService],
    controllers: [MemorandumRecipientsController],
})
export class MemorandumRecipientsModule {}