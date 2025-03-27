import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email or username of the user' })
    @IsNotEmpty()
    @Expose()
    emailOrUserName!: string;

    @ApiProperty({ example: 'password', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    password!: string;
}