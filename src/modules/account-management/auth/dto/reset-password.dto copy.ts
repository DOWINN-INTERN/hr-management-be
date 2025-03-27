import { LoginUserDto } from "./login-user.dto";
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches, ValidateIf } from 'class-validator';

export class ResetPasswordDto extends LoginUserDto {
  @ApiProperty({ example: 'password', description: 'The password confirmation' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Confirm Password must be at least 8 characters long' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Confirm Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
  @ValidateIf((o: ResetPasswordDto) => o.password === o.confirmPassword, { message: 'Passwords do not match' })
  confirmPassword!: string;

  @ApiProperty({ example: '123456', description: 'The recovery code sent to the user' })
  @IsString()
  @IsNotEmpty()
  recoveryCode!: string;
}

