import { Module } from '@nestjs/common';
import { UsersModule } from '../account-management/users/users.module';
import { fileProviders } from './config/file-provider.config';
import { FilesController } from './files.controller';

@Module({
  imports: [UsersModule],
  providers: [...fileProviders],
  controllers: [FilesController],
})
export class FilesModule {}
