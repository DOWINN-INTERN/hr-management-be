import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles.module';
import { Permission } from './entities/permission.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionSeederService } from './services/permission-seeder.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Permission]), RolesModule],
  providers: [PermissionsService, PermissionSeederService],
  exports: [PermissionsService, PermissionSeederService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
