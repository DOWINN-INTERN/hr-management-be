import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { createController } from "@/common/factories/create-controller.factory";
import { Body, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WebPushService } from "../services/web-push.service";
import { GetPushSubscriptionDto } from "./dtos/push-subscription.dto";
import { PushSubscription } from "./entities/push-subscription.entity";
import { PushSubscriptionsService } from "./push-subscriptions.service";

export class PushSubscriptionsController extends createController(
    PushSubscription,       // Entity name for Swagger documentation
    PushSubscriptionsService, // The service handling PushSubscription-related operations
    GetPushSubscriptionDto,  // DTO for retrieving PushSubscriptions
)
{
    constructor(
        private readonly webPushService: WebPushService,
        private readonly pushSubscriptionsService: PushSubscriptionsService,
    )
    {
        super(pushSubscriptionsService);
    }

    override async create(entityDto: null, createdById: string): Promise<GetPushSubscriptionDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: null, updatedById: string): Promise<GetPushSubscriptionDto> {
        return await super.update(id, entityDto, updatedById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return await super.deleteMany(ids, hardDelete);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    @ApiOperation({
        summary: 'Get VAPID public key for push notification subscription',
        description: 'Returns the VAPID public key required for subscribing to push notifications in the browser'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully returned the VAPID public key',
        schema: {
            type: 'object',
            properties: {
                publicKey: {
                    type: 'string',
                    description: 'VAPID public key used for push notification subscription',
                    example: 'BLC8GOevpcpjQiLkO7JmVClQjycvTCYWm6Cq_a-JwvO9B4emcQJwX06KBQeg1ocOcIob5-J_WN5c9Ow0hUvNYoA'
                }
            }
        }
    })
    @Get('vapid-public-key')
    getPublicKey() {
        return { publicKey: this.webPushService.getPublicKey() };
    }
    
    @Authorize()
    @ApiOperation({ summary: 'Subscribe to push notifications' })
    @ApiResponse({ status: 201, description: 'Subscription saved successfully' })
    @Post('subscribe')
    async subscribe(@Body() subscription: PushSubscription, @CurrentUser('sub') userId: string) {
        await this.pushSubscriptionsService.saveSubscription(userId, subscription);
        return { success: true };
    }

    @Authorize()
    @ApiOperation({ summary: 'Unsubscribe from push notifications' })
    @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
    @Post('unsubscribe')
    async unsubscribe(@Body() subscription: { endpoint: string }, @CurrentUser('sub') userId: string) {
        await this.pushSubscriptionsService.removeSubscription(userId, subscription.endpoint);
        return { success: true };
    }
}