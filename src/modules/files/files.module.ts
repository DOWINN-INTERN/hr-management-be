import { Module } from '@nestjs/common';
import { fileProviders } from './config/file-provider.config';

@Module({
  providers: [...fileProviders],
})
export class FilesModule {}
