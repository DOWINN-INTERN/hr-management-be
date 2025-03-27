import { BaseService } from "@/common/services/base.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "../../users/users.service";
import { Address } from "./entities/address.entity";


@Injectable()
export class AddressesService extends BaseService<Address> {
    constructor(
        @InjectRepository(Address)
        private readonly AddressesService: Repository<Address>,
        protected readonly usersService: UsersService
    ) {
        super(AddressesService, usersService);
    }
}
