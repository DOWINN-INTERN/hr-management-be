import { createGateway } from '@/common/factories/create-gateway.factory';

export class NotificationsGateway extends createGateway('notifications')
{

    protected override afterConnect(client: any): void {
        super.afterConnect(client);
        
        if (client.user?.sub) {
            // Notify UserConnectionService that user is online
            this.userConnectionService.userConnected(client.user.sub);
        }
    }

    protected override afterDisconnect(client: any): void {
        super.afterDisconnect(client);
        
        if (client.user?.sub) {
            // Notify UserConnectionService that user is offline
            this.userConnectionService.userDisconnected(client.user.sub);
        }
    }

    // Override emitToUser to check if user is online first
    public override emitToUser(data: any, userId?: string): void {
        if (!userId) {
            this.logger.warn('No userId provided for emitToUser');
            return;
        }

        // Only emit if user is actually connected
        if (this.userConnectionService.isUserOnline(userId)) {
            super.emitToUser(data, userId);
        } else {
            this.logger.debug(`User ${userId} is offline, skipping WebSocket emission`);
        }
    }
}