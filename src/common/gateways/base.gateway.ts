import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketServer,
    WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Types to improve type safety and readability
export interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        [key: string]: any;
    };
    connectionId?: string;
}

export type WsResponseData = {
    event: string;
    data: any;
    room?: string;
};

export abstract class BaseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
    @WebSocketServer() server!: Server;
    protected logger = new Logger(this.constructor.name);

    // Organized client tracking
    protected connectedClients = new Map<string, AuthenticatedSocket>();
    protected userRooms = new Map<string, Set<string>>();
    
    // Rate limiting protection
    protected messageRateLimit = new Map<string, number>();
    protected readonly MAX_MESSAGES_PER_MINUTE = 60;
    
    // Heartbeat tracking
    protected heartbeatInterval?: NodeJS.Timeout;

    constructor(
        protected readonly jwtService: JwtService,
        protected readonly usersService: UsersService,
    ) {}
    
    // Gateway configuration
    protected abstract namespace: string;
    protected abstract eventHandlers: Map<string, (client: AuthenticatedSocket, payload: any) => void>;

    // Lifecycle hooks
    onModuleInit() {
        this.logger.log(`Gateway ${this.constructor.name} initialized`);
        this.setupHeartbeat();
        this.setupEventHandlers();
    }
    
    onModuleDestroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.logger.log(`Gateway ${this.constructor.name} destroyed`);
    }

    afterInit(server: Server) {
        this.logger.log(`WebSocket Gateway ${this.constructor.name} initialized`);
    }

    handleConnection(client: AuthenticatedSocket) {
        try {
            // Generate a unique connection ID for this socket
            client.connectionId = uuidv4();
            
            // Authenticate the client
            if (!this.authenticateClient(client)) {
                this.logger.warn(`Authentication failed for connection ${client.id}`);
                client.disconnect();
                return;
            }
            
            // Check if user exists after authentication
            if (!client.user) {
                this.logger.warn(`User not defined after authentication for connection ${client.id}`);
                client.disconnect();
                return;
            }
            
            const userId = client.user.id;
            this.connectedClients.set(userId, client);
            this.messageRateLimit.set(userId, 0);
            
            this.logger.log(`Client connected: ${userId} (${client.connectionId})`);
            this.afterConnect(client);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Connection error: ${error.message}`, error.stack);
            } else {
                this.logger.error('Connection error: Unknown error');
            }
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        try {
            if (!client.user || !client.user.id) {
                return;
            }
            
            const userId = client.user.id;
            
            // Clean up resources
            this.connectedClients.delete(userId);
            this.messageRateLimit.delete(userId);
            
            // Leave all rooms
            const rooms = this.userRooms.get(userId);
            if (rooms) {
                rooms.forEach(room => {
                    client.leave(room);
                });
                this.userRooms.delete(userId);
            }
            
            this.logger.log(`Client disconnected: ${userId} (${client.connectionId})`);
            this.afterDisconnect(client);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Disconnect error: ${error.message}`, error.stack);
            } else {
                this.logger.error('Disconnect error: Unknown error');
            }
        }
    }

    // Authentication - override this in derived classes for specific auth logic
    protected async authenticateClient(client: AuthenticatedSocket): Promise<boolean> {
        try {
            // Extract token from handshake auth or query parameters
            const token = this.extractTokenFromSocket(client);
            
            if (!token) {
                return false;
            }

            // Verify and decode the token
            const payload = await this.jwtService.verifyToken(token);
            
            // Find the user by ID from the token payload
            const user = await this.usersService.findOneBy({ id: payload.sub });
            
            if (!user) {
                return false;
            }
            
            // Attach user information to the socket
            client.user = {
                id: user.id,
                email: payload.email,
                roles: payload.roles,
                departments: payload.departments,
                organizations: payload.organizations,
                branches: payload.branches,
            };
            
            // Generate a unique connection ID
            client.connectionId = `${user.id}-${Date.now()}`;
            
            return true;
        } catch (error) {
            console.error('WebSocket authentication error:', error);
            return false;
        }
    }

    // Helper method to extract token from socket connection
    private extractTokenFromSocket(client: AuthenticatedSocket): string | null {
        // Try to get from handshake auth
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Try to get from query parameters
        const { token } = client.handshake.query;
        if (token && typeof token === 'string') {
            return token;
        }
        
        return null;
    }
    // Room management
    protected joinRoom(client: AuthenticatedSocket, room: string): void {
        try {
            client.join(room);
            
            if (!client.user) {
                throw new WsException('User not authenticated');
            }
            
            const userId = client.user.id;
            if (!this.userRooms.has(userId)) {
                this.userRooms.set(userId, new Set<string>());
            }
            
            const userRoomSet = this.userRooms.get(userId)!;
            userRoomSet.add(room);
            this.logger.debug(`User ${userId} joined room: ${room}`);
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error joining room: ${error.message}`, error.stack);
                throw new WsException(`Failed to join room: ${error.message}`);
            } else {
                this.logger.error('Error joining room: Unknown error');
                throw new WsException('Failed to join room: Unknown error');
            }
        }
    }
    
    protected leaveRoom(client: AuthenticatedSocket, room: string): void {
        try {
            client.leave(room);
            
            if (!client.user) {
                throw new WsException('User not authenticated');
            }

            const userId = client.user.id;
            const rooms = this.userRooms.get(userId);
            if (rooms) {
                rooms.delete(room);
            }
            
            this.logger.debug(`User ${userId} left room: ${room}`);
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error leaving room: ${error.message}`, error.stack);
                throw new WsException(`Failed to leave room: ${error.message}`);
            } else {
                this.logger.error('Error leaving room: Unknown error');
                throw new WsException('Failed to leave room: Unknown error');
            }
        }
    }
    
    // Messaging methods
    protected emitToUser(userId: string, event: string, data: any): boolean {
        try {
            const client = this.connectedClients.get(userId);
            if (!client) {
                return false;
            }
            
            client.emit(event, data);
            return true;
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Error emitting to user: ${error.message}`, error.stack);
            } else {
                this.logger.error('Error emitting to user: Unknown error');
            }
            return false;
        }
    }
    
    protected emitToRoom(room: string, event: string, data: any): void {
        try {
            this.server.to(room).emit(event, data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Error emitting to room: ${error.message}`, error.stack);
                throw new WsException(`Failed to emit to room: ${error.message}`);
            }
            else
            {
                this.logger.error('Error emitting to room: Unknown error');
                throw new WsException('Failed to emit to room: Unknown error');
            }
        }
    }
    
    protected broadcast(event: string, data: any, exceptUserId?: string): void {
        try {
            if (exceptUserId) {
                const exceptClient = this.connectedClients.get(exceptUserId);
                if (exceptClient) {
                    exceptClient.broadcast.emit(event, data);
                } else {
                    this.server.emit(event, data);
                }
            } else {
                this.server.emit(event, data);
            }
        } catch (error: unknown) {
            if (error instanceof Error)
            {
                this.logger.error(`Error broadcasting: ${error.message}`, error.stack);
                throw new WsException(`Failed to broadcast: ${error.message}`);
            }
            else
            {
                this.logger.error('Error broadcasting: Unknown error');
                throw new WsException('Failed to broadcast: Unknown error');
            }
        }
    }
    
    // Rate limiting
    protected isRateLimited(userId: string): boolean {
        const currentRate = this.messageRateLimit.get(userId) || 0;
        if (currentRate >= this.MAX_MESSAGES_PER_MINUTE) {
            return true;
        }
        
        this.messageRateLimit.set(userId, currentRate + 1);
        return false;
    }
    
    // Heartbeat management
    protected setupHeartbeat(): void {
        // Reset rate limits every minute
        this.heartbeatInterval = setInterval(() => {
            this.messageRateLimit.clear();
            
            // Check for stale connections
            this.checkConnections();
        }, 60000); // 1 minute
    }
    
    protected checkConnections(): void {
        // Implement connection checking if needed
        // For example, ping clients and disconnect those not responding
    }
    
    // Event handling setup
    protected setupEventHandlers(): void {
        this.server.on('connection', (socket: AuthenticatedSocket) => {
            // Register all event handlers from the derived class
            if (this.eventHandlers) {
                this.eventHandlers.forEach((handler, event) => {
                    socket.on(event, (payload) => {
                        try {
                            // Validate user is authenticated
                            if (!socket.user || !socket.user.id) {
                                socket.emit('error', { message: 'Not authenticated' });
                                return;
                            }
                            
                            // Check rate limiting
                            if (this.isRateLimited(socket.user.id)) {
                                socket.emit('error', { message: 'Rate limit exceeded' });
                                return;
                            }
                            
                            // Execute the handler
                            handler(socket, payload);
                        } catch (error: unknown) {
                            if (error instanceof Error) {
                                this.logger.error(`Error handling event ${event}: ${error.message}`, error.stack);
                            }
                            else {
                                this.logger.error(`Error handling event ${event}: Unknown error`);
                            }
                            socket.emit('error', { message: 'Internal server error' });
                        }
                    });
                });
            }
        });
    }
    
    // Hooks for derived classes
    protected afterConnect(client: AuthenticatedSocket): void {}
    protected afterDisconnect(client: AuthenticatedSocket): void {}
}