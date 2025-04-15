import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { createController } from '@/common/factories/create-controller.factory';
import {
    Body,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse
} from '@nestjs/swagger';
import { GetNotificationDto, NotificationDto, UpdateNotificationDto } from './dtos/notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';


// Create the base controller for standard CRUD operations
export class NotificationsController extends createController<
    Notification, 
    GetNotificationDto,
    NotificationDto,
    UpdateNotificationDto
>(
    'Notifications',
    NotificationsService,
    GetNotificationDto,
    NotificationDto,
) {

    constructor(
        protected readonly notificationsService: NotificationsService,
        protected readonly notificationsGateway: NotificationsGateway,
    ) {
        super(notificationsService);
    }


    @Post()
    @ApiOperation({ summary: 'Create and send new notifications' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Returns created notifications',
        type: GetNotificationDto,
        isArray: true
    })
    override async create(
        @Body() createNotificationDto: NotificationDto,
        @CurrentUser('sub') createdById: string
    ) {
        // Call the specialized method for bulk notifications
        const notifications = await this.notificationsService.createBulkNotifications(createNotificationDto);
        
        // Send real-time notifications
        for (const notification of notifications) {
            await this.notificationsGateway.sendNotification(notification);
        }
        
        return notifications;
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
        await this.notificationsService.markAsRead(id, userId);
        
        const unreadCount = await this.notificationsService.countUnreadByUser(userId);
        
        return { success: true, unreadCount };
    }

    @Patch('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiQuery({ 
        name: 'category', 
        required: false, 
        description: 'Optionally limit to a specific category' 
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'All notifications marked as read',
        schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            unreadCount: { type: 'number' }
        }
        }
    })
    async markAllAsRead(
        @Query('category') category: string,
        @CurrentUser('sub') userId: string
    ) {
        await this.notificationsService.markAllAsRead(userId);
        
        return { success: true, unreadCount: 0 };
    }
}