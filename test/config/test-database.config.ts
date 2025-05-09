import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getTestDbConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'mysql',
    host: configService.get('TEST_DB_HOST', 'localhost'),
    port: configService.get('TEST_DB_PORT', 3306),
    username: configService.get('TEST_DB_USERNAME', 'root'),
    password: configService.get('TEST_DB_PASSWORD', ''),
    database: configService.get('TEST_DB_DATABASE', 'neststarter_test'),
    entities: [join(__dirname, '../../src/**/*.entity{.ts,.js}')],
    synchronize: true, // Only true for testing
    dropSchema: true, // Recreate schema on each test run
    logging: false,
  };
};