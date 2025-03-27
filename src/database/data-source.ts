import { Address } from '@/modules/account-management/profiles/addresses/entities/address.entity';
import { Profile } from '@/modules/account-management/profiles/entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();
const configService = new ConfigService();
const isProduction = configService.get('NODE_ENV') === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') || '3306', 10),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: ['dist/**/*.entity{.ts,.js}', Address, Profile],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    synchronize: !isProduction,
    logging: false,
    ssl: isProduction,
    extra: {
        ssl: isProduction ? { rejectUnauthorized: false } : null,
    },
};

export default new DataSource(dataSourceOptions);