import { BaseDto } from '@/common/dtos/base.dto';
import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class EmailConfigurationDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Name of the email configuration',
        example: 'Gmail SMTP'
    })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ 
        description: 'Description of the email configuration', 
        required: false,
        example: 'Gmail SMTP server for sending notifications'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        description: 'SMTP server host',
        example: 'smtp.gmail.com'
    })
    @IsNotEmpty()
    @IsString()
    host!: string;

    @ApiProperty({ 
        description: 'SMTP server port',
        example: 587,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    port!: number;

    @ApiProperty({ 
        description: 'Whether to use secure connection (TLS/SSL)',
        example: false,
        default: false
    })
    @IsBoolean()
    secure!: boolean;

    @ApiProperty({ 
        description: 'SMTP username',
        example: 'user@example.com'
    })
    @IsNotEmpty()
    @IsString()
    username!: string;

    @ApiProperty({ 
        description: 'SMTP password',
        example: 'password123'
    })
    @IsNotEmpty()
    @IsString()
    password!: string;

    @ApiProperty({ 
        description: 'Email address to send emails from',
        example: 'noreply@example.com' 
    })
    @IsNotEmpty()
    @IsEmail()
    fromEmail!: string;

    @ApiProperty({ 
        description: 'Display name for the from email address',
        required: false,
        example: 'Example System'
    })
    @IsOptional()
    @IsString()
    fromName?: string;

    @ApiProperty({ 
        description: 'Whether this is the default email configuration',
        default: false
    })
    @IsBoolean()
    isDefault!: boolean;
}

export class UpdateEmailConfigurationDto extends PartialType(EmailConfigurationDto) {}

export class GetEmailConfigurationDto extends createGetDto(UpdateEmailConfigurationDto, 'email configuration') {}