import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class ManagementWorkTimeRequestDto {
  @ApiPropertyOptional({
    description: 'ID of a single employee (use either this or groupId or employeeIds)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Employee ID must be a valid UUID' })
  @ValidateIf(o => !o.groupId && !o.employeeIds)
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'IDs of multiple employees (use either this or employeeId or groupId)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsUUID('4', { each: true, message: 'Each employee ID must be a valid UUID' })
  @ValidateIf(o => !o.groupId && !o.employeeId)
  @IsOptional()
  employeeIds?: string[];

  @ApiPropertyOptional({
    description: 'ID of a shift group (use either this or employeeId or employeeIds)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Group ID must be a valid UUID' })
  @ValidateIf(o => !o.employeeId && !o.employeeIds)
  @IsOptional()
  groupId?: string;

  @ApiProperty({
    description: 'Date of the work request (YYYY-MM-DD)',
    example: '2023-05-15',
    type: String,
  })
  @IsDateString({}, { message: 'Date must be in YYYY-MM-DD format' })
  date!: string;

  @ApiProperty({
    description: 'Type of work time request',
    enum: [AttendanceStatus.EARLY, AttendanceStatus.OVERTIME],
    example: AttendanceStatus.EARLY,
  })
  @IsEnum(AttendanceStatus, { message: 'Type must be either EARLY or OVERTIME' })
  @IsIn([AttendanceStatus.EARLY, AttendanceStatus.OVERTIME], { 
    message: 'Only EARLY or OVERTIME request types are allowed' 
  })
  type!: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Indicates if early time should be considered as overtime',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  earlyTimeAsOvertime?: boolean;

  @ApiProperty({
    description: 'Reason for the work request',
    example: 'Special project preparation',
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Reason must be a string' })
  reason!: string;
}