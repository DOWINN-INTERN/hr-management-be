import { ConfigService } from "@nestjs/config";
import { LocalFileService } from "../services/local-file.service";

export const FILE_SERVICE = 'FILE_SERVICE';

export const fileProviderConfig = {
    provide: FILE_SERVICE,
    useFactory: (configService: ConfigService) => {
      // Read provider from options or config
      const fileProvider = 
        configService.get('FILE_PROVIDER') || 
        'local';
      
      // Select the appropriate implementation based on provider
      switch (fileProvider.toLowerCase()) {
        case 'cloudflare':
          // return new CloudflareFileService(configService);
          throw new Error('Cloudflare provider not implemented yet');
        case 's3':
          // return new S3FileService(configService);
          throw new Error('S3 provider not implemented yet');
        case 'local':
        default:
          return new LocalFileService(configService);
      }
    },
    inject: [ConfigService],
};

export const fileProviders = [fileProviderConfig, LocalFileService];