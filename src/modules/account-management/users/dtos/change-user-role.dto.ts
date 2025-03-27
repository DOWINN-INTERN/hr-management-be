import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeUserRoleDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: ['admin'], description: 'The roles to assign to the user' })
    @IsArray()
    @IsNotEmpty()
    roles!: string[];
}