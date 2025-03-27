import { Action } from '@/common/enums/action.enum';
import { LogType } from '@/common/enums/log-type.enum';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LogActivityDto {
    @ApiProperty({
        enum: Action,
        description: 'The action performed in the activity log'
    })
    @IsEnum(Action)
    @IsNotEmpty()
    action!: Action;

    @ApiPropertyOptional({
        type: String,
        description: 'The subject involved in the activity'
    })
    @IsString()
    subject!: string;

    @ApiPropertyOptional({
        type: () => User,
        description: 'The user who performed the action'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    user?: User;

    @ApiPropertyOptional({
        type: String,
        description: 'Additional message about the activity'
    })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({
        type: Object,
        description: 'Additional details about the activity in JSON format'
    })
    @IsOptional()
    @IsObject()
    details?: Record<string, any>;

    @ApiPropertyOptional({
        enum: LogType,
        description: 'The type of log'
    })
    @IsOptional()
    @IsEnum(LogType)
    logType?: LogType;
}