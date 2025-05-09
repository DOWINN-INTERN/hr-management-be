import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getTestDbConfig } from '../config/test-database.config';

interface TestModuleOptions {
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | any>;
  controllers?: Type<any>[];  
  providers?: Provider[];
  entities?: Function[];
}

export class TestModuleUtil {
  static async createTestingModule(options: TestModuleOptions): Promise<TestingModule> {
    const { imports = [], controllers = [], providers = [], entities = [] } = options;
    
    return Test.createTestingModule({
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
        ...(entities.length > 0 ? [TypeOrmModule.forFeature(entities)] : []),
        ...imports,
      ],
      controllers,
      providers,
    }).compile();
  }
  
  static async setupTestTransaction(dataSource: DataSource, 
    testFn: (queryRunner: any) => Promise<void>): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await testFn(queryRunner);
    } finally {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }
}