import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'Organization ID',
    required: false,
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    description: 'Branch ID',
    required: false,
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  branchId?: string;

  @ApiProperty({
    description: 'Department ID',
    required: false,
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  departmentId?: string;

  @ApiProperty({
    description: 'User ID',
    required: false,
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  userId?: string;
}