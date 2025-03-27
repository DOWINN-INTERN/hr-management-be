import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { GetUserDto } from './dtos/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User>{
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {
    super(userRepository, null);
  }

  async signUpUser(model: RegisterUserDto): Promise<GeneralResponseDto<GetUserDto>> {
    const hashedPassword = await bcrypt.hash(model.password, 10);
    const user = this.create({ ...model, password: hashedPassword, userName: model.userName.toLowerCase().trim(), email: model.email.toLowerCase().trim() });

    const userDto: GetUserDto = plainToInstance(GetUserDto, user);
    return { message: 'Account created successfully!', data: userDto };
  }

//   /**
//  * Sanitizes user data by removing sensitive information before sending to clients
//  * 
//  * @param user - The user entity to sanitize
//  * @param options - Options for customizing sanitization
//  * @returns A sanitized user object safe for client-side use
//  */
//   sanitizeUser(
//     user: User, 
//     options: { 
//       includeRoles?: boolean; 
//       includePermissions?: boolean;
//       fields?: string[];
//     } = {}
//   ): Partial<User | null> {
//     if (!user) return null;

//     // Create a default options object
//     const defaultOptions = {
//       includeRoles: true,
//       includePermissions: false,
//       ...options
//     };

//     // If specific fields are requested, return only those
//     if (defaultOptions.fields && defaultOptions.fields.length > 0) {
//       return defaultOptions.fields.reduce((acc, field) => {
//         if (field in user) {
//           acc[field as keyof User] = user[field as keyof User] as any;
//         }
//         return acc;
//       }, {} as Partial<User>);
//     }

//     // Start with a clean object
//     const sanitized: Partial<User> = {
//       id: user.id,
//       email: user.email,
//       firstName: user
//       lastName: user.lastName,
//       profileImage: user.profileImage,
//       isActive: user.isActive,
//       isEmailVerified: user.isEmailVerified,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     // Include roles if requested and available
//     if (defaultOptions.includeRoles && user.roles) {
//       sanitized.roles = user.roles.map(role => ({
//         id: role.id,
//         name: role.name,
//         description: role.description,
//         // Include permissions if requested
//         ...(defaultOptions.includePermissions && role.permissions 
//           ? {
//               permissions: role.permissions.map(permission => ({
//                 id: permission.id,
//                 action: permission.action,
//                 subject: permission.subject,
//                 description: permission.description,
//               }))
//             } 
//           : {})
//       }));
//     }

//     // Include any public preference settings
//     if (user.preferences) {
//       sanitized.preferences = user.preferences;
//     }

//     return sanitized;
//   }
}
