import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Override } from '@/common/decorators/override.decorator';
import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { Action } from '@/common/enums/action.enum';
import { createController } from '@/common/factories/create-controller.factory';
import { Body, Delete, Get, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiResponse
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
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

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetNotificationDto> {
        return await super.findOne(fieldsString, relations, select);
    }

    @Override()
    @ApiOperation({ 
        summary: 'Send a Notification to Multiple Users',
        description: 'Creates a notification for multiple recipients at once and queues them for delivery'
    })
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
        type: GetNotificationDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No notifications to mark as read',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    async markAsRead(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser('sub') userId: string
    ): Promise<GetNotificationDto> {
        const notification = await this.notificationsService.update(id, { read: true, readAt: new Date() }, userId);
        return plainToInstance(GetNotificationDto, notification);
    }

    @Patch('mark-all-as-read')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'All notifications marked as read',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No notifications to mark as read',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    async markAllAsRead(
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const result = await this.notificationsService.markAllAsRead(userId);

        if (!result)
            throw new NotFoundException('No notifications to mark as read');
        
        return {
            message: 'All notifications has been marked as read'
        };
    }

    @Get('count-unread')
    @Authorize({ endpointType: Action.READ})
    @ApiOperation({ summary: 'Get count of unread notifications' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Count of unread notifications',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    async countUnread(
        @CurrentUser('sub') userId: string
    ): Promise<{ count: number }> {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    @Delete('clear-all')
    @Authorize({ endpointType: Action.DELETE })
    @ApiOperation({ summary: 'Clear all notifications' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'All notifications cleared',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No notifications to clear',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    async clearAll(
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const result = await this.notificationsService.clearAll(userId);
        if (!result) {
            throw new NotFoundException('No notifications to clear');
        }
        return {
            message: 'All notifications have been cleared'
        };
    }
}
