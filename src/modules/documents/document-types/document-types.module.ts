import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypesController } from './document-types.controller';
import { DocumentTypesService } from './document-types.service';
import { DocumentType } from './entities/document-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentType]), UsersModule],
  providers: [DocumentTypesService],
  exports: [DocumentTypesService],
  controllers: [DocumentTypesController],
})
export class DocumentTypesModule {}
