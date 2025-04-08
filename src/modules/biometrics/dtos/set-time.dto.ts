import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class SetTimeDto {
  @ApiProperty({
    description: 'Time to set on the device (ISO format)',
    example: '2025-04-08T12:00:00.000Z'
  })
  @IsNotEmpty()
  @IsDateString()
  time!: string;
}