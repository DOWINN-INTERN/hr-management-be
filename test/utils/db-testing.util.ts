import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { getTestDbConfig } from '../config/test-database.config';

export class DbTestingUtil {
  private static connection: DataSource;
  private static app: INestApplication;

  static async initializeTestModuleAndApp(): Promise<{
    moduleRef: TestingModule;
    app: INestApplication;
    connection: DataSource;
  }> {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: getTestDbConfig,
        }),
        AppModule,
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();
    
    const connection = moduleRef.get<DataSource>(DataSource);
    this.connection = connection;
    this.app = app;
    
    return { moduleRef, app, connection };
  }

  static async resetDatabase(): Promise<void> {
    if (this.connection) {
      const entities = this.connection.entityMetadatas;
      const tableNames = entities
        .filter(entity => !entity.tableType || entity.tableType === 'regular')
        .map(entity => `"${entity.tableName}"`);
      
      await this.connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
      
      for (const tableName of tableNames) {
        try {
          await this.connection.query(`TRUNCATE TABLE ${tableName};`);
        } catch (error) {
          console.log(`Error truncating ${tableName}`, error);
        }
      }
      
      await this.connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    }
  }

  static async closeTestConnection(): Promise<void> {
    if (this.app) await this.app.close();
    if (this.connection && this.connection.isInitialized) await this.connection.destroy();
  }
}