import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { GetUserDto, UpdateUserDto } from "./dtos/user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

export class UsersController extends createController(User, UsersService, GetUserDto, undefined, UpdateUserDto)
{
  override create(entityDto: null, createdById: string): Promise<GetUserDto> {
      return super.create(entityDto, createdById);
  }

  override async delete(id: string): Promise<GeneralResponseDto> {
      return await super.delete(id);
  }
}