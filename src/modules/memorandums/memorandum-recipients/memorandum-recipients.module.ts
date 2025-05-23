import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { MemorandumRecipientsController } from './memorandum-recipients.controller';
import { MemorandumRecipientsService } from './memorandum-recipients.service';
import { MemorandumRecipient } from './entities/memorandum-recipient.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemorandumRecipient]),

    ],
    providers: [MemorandumRecipientsService],
    exports: [MemorandumRecipientsService],
    controllers: [MemorandumRecipientsController],
})
export class MemorandumRecipientsModule {}