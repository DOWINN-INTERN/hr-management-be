import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private configService: ConfigService) {}

  isProduction(): boolean {
    return this.configService.getOrThrow<string>('NODE_ENV') === 'production';
  }

  isDevelopment(): boolean {
    return this.configService.getOrThrow<string>('NODE_ENV') === 'development';
  }
}