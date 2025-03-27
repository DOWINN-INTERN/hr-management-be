import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../users/users.module';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';
import { ProvincesModule } from './provinces/provinces.module';
import { BarangaysModule } from './barangays/barangays.module';
import { RegionsModule } from './regions/regions.module';
import { CitiesOrMunicipalitiesModule } from './cities-or-municipalities/cities-or-municipalities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), UsersModule, ProvincesModule, BarangaysModule, RegionsModule, CitiesOrMunicipalitiesModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
