import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class GeneralResponseDto<T = void> {
  @ApiProperty({ description: 'Message providing additional information about the response', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;

  @ApiProperty({ description: 'Optional data returned with the response', required: false })
  @IsOptional()
  data?: T;
}
