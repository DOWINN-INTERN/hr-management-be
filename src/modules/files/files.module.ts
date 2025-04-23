import { Module } from '@nestjs/common';
import { fileProviders } from './config/file-provider.config';
import { FilesController } from './files.controller';

@Module({
  providers: [...fileProviders],
  controllers: [FilesController],
})
export class FilesModule {}
