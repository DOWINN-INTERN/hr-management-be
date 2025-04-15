import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { NotificationTargetType } from "@/common/enums/notification-target-type.enum";
import { NotificationType } from "@/common/enums/notification-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

export class NotificationDto extends BaseDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'New Payment Received'
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'You have received a new payment of $500'
  })
  @IsString()
  message!: string;

  @ApiProperty({
    description: 'Icon or image URL for the notification',
    example: 'https://example.com/icons/payment.png',
    required: false
  })
  @IsOptional()
  @IsString()
  iconOrImage?: string;

  @ApiProperty({
    description: 'The type of notification',
    enum: NotificationType,
    example: NotificationType.INFO,
    default: NotificationType.INFO
  })
  @IsEnum(NotificationType)
  type: NotificationType = NotificationType.INFO;

  @ApiProperty({
    description: 'Optional link related to notification',
    example: '/payments/123',
    required: false
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    default: false
  })
  @IsBoolean()
  read: boolean = false;

  @ApiProperty({
    description: 'When the notification was read',
    required: false,
    type: Date
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readAt?: Date;

  @ApiProperty({
    description: 'The category of notification',
    example: 'payment',
    required: true
  })
  @IsString()
  category!: string;

  @ApiProperty({
    description: 'The type of recipient this notification is targeted to',
    example: 'user',
    enum: NotificationTargetType,
    required: true
  })
  @IsEnum(NotificationTargetType)
  targetType!: NotificationTargetType;
  
  @ApiProperty({
    description: 'Optional ID of the target recipient',
    example: '123e4567-e89b-12d3-a456-426614174099',
    required: false
  })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiProperty({
    description: 'Additional metadata for the notification',
    example: { amount: 500, currency: 'USD' },
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
      description: 'Recipients of the notification',
      required: true,
      isArray: true,
      type: [ReferenceDto]
  })
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  recipients!: ReferenceDto[];
}

export class UpdateNotificationDto extends PartialType(NotificationDto) {}

export class GetNotificationDto extends createGetDto(UpdateNotificationDto, 'notification') {}