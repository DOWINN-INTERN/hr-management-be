import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Override } from '@/common/decorators/override.decorator';
import { createController } from '@/common/factories/create-controller.factory';
import { Body, HttpStatus, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiResponse
} from '@nestjs/swagger';
import { GetNotificationDto, NotificationDto, UpdateNotificationDto } from './dtos/notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';

export class NotificationsController extends createController(Notification, NotificationsService, GetNotificationDto, NotificationDto, UpdateNotificationDto)
{

    constructor(
        protected readonly notificationsService: NotificationsService,
        protected readonly notificationsGateway: NotificationsGateway,
    ) {
        super(notificationsService);
    }

    @ApiOperation({ 
        summary: 'Send a Notification to Multiple Users',
        description: 'Creates a notification for multiple recipients at once and queues them for delivery'
    })
    @Override()
    override async create(
        @Body() createNotificationDto: NotificationDto,
        @CurrentUser('sub') createdById: string
    ) {
    return await this.notificationsService.createBulkNotifications(createNotificationDto, createdById);
    }   

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiParam({ name: 'id', description: 'Notification ID' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Notification marked as read',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                unreadCount: { type: 'number' }
            }
        }
    })
    async markAsRead(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser('sub') userId: string
    ) {
        return await this.notificationsService.update(id, { read: true, readAt: new Date() }, userId);
    }
}
