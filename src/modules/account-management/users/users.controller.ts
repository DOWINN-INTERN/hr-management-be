import { BaseController } from '@/common/controllers/base.controller';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { GetUserDto } from './dtos/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller()
export class UsersController extends BaseController<User, GetUserDto, RegisterUserDto> {
    constructor(private readonly usersService: UsersService) {
        super(usersService, GetUserDto);
    }
}