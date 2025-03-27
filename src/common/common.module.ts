import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/account-management/users/users.module';
import { CommonService } from './services/common.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [UsersModule],
  providers: [
    CommonService, TransactionService
  ],
  exports: [CommonService, TransactionService],
})

export class CommonModule {}
