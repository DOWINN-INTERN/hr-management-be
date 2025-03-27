import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, ValidateIf } from 'class-validator';

export class RegisterUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    @Expose()
    email!: string;

    @ApiProperty({ example: 'user', description: 'The username of the user' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+$/, { message: 'Username must contain only lowercase letters and numbers' })
    @MinLength(5, { message: 'Username must be at least 5 characters long' })
    @Expose()
    userName!: string;

    @ApiProperty({ example: 'password', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
    password!: string;
    
    @ApiProperty({ example: 'password', description: 'The password confirmation' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Confirm Password must be at least 8 characters long' })
    @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Confirm Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
    @ValidateIf((o: RegisterUserDto) => o.password === o.confirmPassword, { message: 'Passwords do not match' })
    confirmPassword!: string;
}