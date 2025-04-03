import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../account-management/users/users.module';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), UsersModule,
  RouterModule.register([
            {
                path: 'addresses',
                module: AddressesModule
            },
        ]),],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
