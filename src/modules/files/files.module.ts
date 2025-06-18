import { Global, Module } from '@nestjs/common';
import { fileProviders } from './config/file-provider.config';
import { FilesController } from './files.controller';
import { ImportExportService } from './services/import-export.service';

@Global()
@Module({
  providers: [...fileProviders],
  exports: [ImportExportService],
  controllers: [FilesController],
})
export class FilesModule {}
