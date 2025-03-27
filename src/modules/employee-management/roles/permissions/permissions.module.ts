import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../../account-management/users/users.module';
import { RolesModule } from '../roles.module';
import { Permission } from './entities/permission.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionSeederService } from './services/permission-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), UsersModule, RolesModule],
  providers: [PermissionsService, PermissionSeederService],
  exports: [PermissionsService, PermissionSeederService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
