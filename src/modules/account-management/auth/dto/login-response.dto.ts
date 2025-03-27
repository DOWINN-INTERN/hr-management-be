import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjA5MjQ2MjUyLCJleHAiOjE2MDkyNTk0NTJ9.1eHJ4zZ1zr1v3r7w1eHJ4zZ1zr1v3r7w1eHJ4zZ1zr1v3r7w', description: 'The JWT token' })
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  // @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjA5MjQ2MjUyLCJleHAiOjE2MDkyNTk0NTJ9.1eHJ4zZ1zr1v3r7w1eHJ4zZ1zr1v3r7w1eHJ4zZ1zr1v3r7w', description: 'The JWT refresh token' })
  // @IsString()
  // @IsNotEmpty()
  // refreshToken!: string;
}

