import { createController } from "@/common/factories/create-controller.factory";
import { GetUserDto, UpdateUserDto, UserDto } from "./dtos/user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

export class UsersController extends createController<
  User,
  GetUserDto,
  UserDto,
  UpdateUserDto
>(
    'Users',       // Entity name for Swagger documentation
    UsersService, // The service handling Users-related operations
    GetUserDto,  // DTO for retrieving Users
    UserDto,     // DTO for creating Users
    UpdateUserDto // DTO for updating Users
) {
  override async create(entityDto: UserDto, createdById: string): Promise<GetUserDto> {
      return await super.create(entityDto, createdById);
  }
}