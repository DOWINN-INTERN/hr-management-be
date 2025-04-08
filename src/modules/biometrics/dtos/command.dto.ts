import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommandDto {
  @ApiProperty({
    description: 'Command to execute on the device',
    example: 'CMD_UNLOCK'
  })
  @IsNotEmpty()
  @IsString()
  command!: string;

  @ApiProperty({
    description: 'Optional data for the command',
    example: '',
    required: false
  })
  @IsOptional()
  @IsString()
  data?: string;
}