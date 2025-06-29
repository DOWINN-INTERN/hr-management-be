import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { UserConnectionService } from '@/modules/notifications/services/user-connection.service';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketServer,
    WsException
} from '@nestjs/websockets';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

// Types to improve type safety and readability
export interface AuthenticatedSocket extends Socket {
    user?: IJwtPayload;
    connectionId?: string;
}

// Type-safe event handling
type WsEventHandler<T = any> = (client: AuthenticatedSocket, payload: T) => Promise<void> | void;

// Add middleware type definition here
export type SocketMiddleware = (
  client: AuthenticatedSocket,
  next: (err?: Error) => void
) => void;

export type WsResponseData = {
    event: string;
    data: any;
    room?: string;
};

export abstract class BaseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
    @WebSocketServer() server!: Server;
    protected logger = new Logger(this.constructor.name);
    private readonly connections = new Map<string, { count: number, lastConnect: Date }>();
    // Organized client tracking
    protected connectedClients = new Map<string, AuthenticatedSocket>();
    protected userRooms = new Map<string, Set<string>>();
    
    // Add middleware support
    protected middlewares: SocketMiddleware[] = [];
    
    // Rate limiting protection
    protected messageRateLimit = new Map<string, number>();
    protected readonly MAX_MESSAGES_PER_MINUTE = 60;
    protected readonly HEARTBEAT_INTERVAL = 60000; // ms
    protected readonly CONNECTION_TIMEOUT = 300000; // 5 minutes in ms
    protected readonly AUTH_TOKEN_EXPIRY_BUFFER = 300; // 5 minutes in seconds
    
    // Heartbeat tracking
    protected heartbeatInterval?: NodeJS.Timeout;

    constructor(
        protected readonly userConnectionService: UserConnectionService,
        protected readonly jwtService: JwtService,
        protected readonly usersService: UsersService,
        protected readonly configService: ConfigService,
    ) {
        
    }
    
    // Gateway configuration
    protected abstract namespace: string;
    protected eventHandlers: Map<string, (client: AuthenticatedSocket, payload: any) => void> = new Map();

    protected metrics = {
        totalConnections: 0,
        activeConnections: 0,
        messagesProcessed: 0,
        authFailures: 0,
        rateLimitHits: 0
    };

    // Lifecycle hooks
    onModuleInit() {
        // this.logger.log(`Gateway ${this.constructor.name} initialized`);
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
        if (!server || !server.engine) {
            // this.logger.warn('Server or server.engine not available in afterInit');
            return; // Exit early if server or server.engine is not available
        }

        // Configure compression
        const compressionThreshold = this.configService.get<number>('websocket.compressionThreshold', 1024);
        this.server?.engine?.on('connection', (socket) => {
            socket.compress = (data: any) => {
                return data.length > compressionThreshold;
            };
        });

        const corsConfig = {
            origin: this.configService.getOrThrow<string[]>('CORS_ORIGINS'),
            credentials: true,
            methods: '*' as string | string[],
            allowedHeaders: 'Content-Type, Accept, Authorization',
            maxAge: 86400 // 24 hours
        };
        
        // Apply CORS configuration to the server
        server.engine.on('headers', (headers: any, req: any) => {
            const origin = req.headers.origin;
            if (corsConfig.origin.includes(origin) || corsConfig.origin.includes('*')) {
                headers['Access-Control-Allow-Origin'] = origin;
                headers['Access-Control-Allow-Credentials'] = corsConfig.credentials;
                headers['Access-Control-Allow-Methods'] = typeof corsConfig.methods === 'string' ? 
                    corsConfig.methods : (corsConfig.methods as string[]).join(', ');
                headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders;
                headers['Access-Control-Max-Age'] = corsConfig.maxAge;
                
                // Security headers
                headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
                headers['X-Content-Type-Options'] = 'nosniff';
                headers['X-XSS-Protection'] = '1; mode=block';
                headers['X-Frame-Options'] = 'SAMEORIGIN'; // Prevents clickjacking
                headers['Content-Security-Policy'] = "default-src 'self'"; // Restrictive CSP
            }
        });
    }

    handleConnection(client: AuthenticatedSocket) {
        try {
            const ip = client.handshake.address;
            const current = this.connections.get(ip) || { count: 0, lastConnect: new Date() };
            
            // Rate limiting logic
            const now = new Date();
            const timeDiff = now.getTime() - current.lastConnect.getTime();
            if (timeDiff < 1000 && current.count > 5) {
                client.disconnect();
                this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
                return;
            }
            
            // Update connection tracking
            this.connections.set(ip, { 
                count: timeDiff < 10000 ? current.count + 1 : 1, 
                lastConnect: now 
            });


            this.metrics.totalConnections++;
            this.metrics.activeConnections++;
            // Generate a unique connection ID for this socket
            client.connectionId = uuidv4();
            
            // Apply middlewares before proceeding with connection
            this.applyMiddlewares(client, async (err) => {
                if (err) {
                    this.logger.error(`Middleware error: ${err.message}`);
                    client.disconnect();
                    return;
                }
                
                // Continue with existing connection logic
                const isAuthenticated = await this.authenticateClient(client);
                if (!isAuthenticated) {
                    this.logger.warn(`Authentication failed for connection ${client.id}`);
                    client.disconnect();
                    return;
                }
                
                // Rest of your existing connection logic...
                if (!client.user) {
                    this.logger.warn(`User not defined after authentication for connection ${client.id}`);
                    client.disconnect();
                    return;
                }
                
                const user = client.user.sub;
                this.connectedClients.set(user, client);
                this.messageRateLimit.set(user, 0);
                
                this.logger.log(`${this.constructor.name} active connections: ${this.metrics.activeConnections}`);

                this.afterConnect(client);
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Connection error: ${error.message}`, error.stack);
            } else {
                this.logger.error('Connection error: Unknown error');
            }
            client.disconnect();
        }
    }

    // Add to BaseGateway class
    async handleShutdown() {
        this.logger.log(`Gateway ${this.constructor.name} shutting down gracefully`);
        
        // Send disconnect warning to all clients
        this.broadcast('server_shutdown', { 
            message: 'Server is shutting down for maintenance', 
            reconnectIn: 10000 // ms
        });
        
        // Wait to allow clients to process the message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Close all connections
        this.connectedClients.forEach((client) => {
            client.disconnect(true);
        });
        
        // Clear data structures
        this.connectedClients.clear();
        this.userRooms.clear();
        this.messageRateLimit.clear();
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }

    protected validatePayload<T>(payload: any, schema: ClassConstructor<T>): T {
        try {
            return plainToClass(schema, payload, { excludeExtraneousValues: true });
        } catch (error) {
            throw new WsException('Invalid payload format');
        }
    }
    
    protected addMiddleware(middleware: SocketMiddleware): void {
        this.middlewares.push(middleware);
    }

    private applyMiddlewares(client: AuthenticatedSocket, callback: (err?: Error) => void): void {
        let index = 0;
        
        const next = (err?: Error) => {
            if (err) return callback(err);
            if (index >= this.middlewares.length) return callback();
            
            const middleware = this.middlewares[index++];
            try {
                middleware(client, next);
            } catch (error) {
                next(error instanceof Error ? error : new Error('Middleware error'));
            }
        };
        
        next();
    }

    handleDisconnect(client: AuthenticatedSocket) {
        try {
            this.metrics.activeConnections--;
            if (!client.user || !client.user.sub || !client.user.email) {
                return;
            }
            
            const user = client.user.email || client.user.sub;
            
            // Clean up resources
            this.connectedClients.delete(user);
            this.messageRateLimit.delete(user);
            
            // Leave all rooms
            const rooms = this.userRooms.get(user);
            if (rooms) {
                rooms.forEach(room => {
                    client.leave(room);
                });
                this.userRooms.delete(user);
            }
            
            this.logger.log(`${this.constructor.name} total active connections: ${this.metrics.activeConnections}`);
            this.afterDisconnect(client);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Disconnect error: ${error.message}`, error.stack);
            } else {
                this.logger.error('Disconnect error: Unknown error');
            }
        }
    }

    // A centralized error handler
    protected handleError(context: string, error: unknown, client?: AuthenticatedSocket): void {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        
        this.logger.error(`${context}: ${errorMessage}`, stack);
        
        if (client) {
        client.emit('error', { 
            message: 'An error occurred', 
            code: 'INTERNAL_ERROR',
            context 
        });
        }
    }

    // Authentication - override this in derived classes for specific auth logic
    protected async authenticateClient(client: AuthenticatedSocket): Promise<boolean> {
        try {
          const token = this.extractTokenFromSocket(client);
          
          if (!token) {
            this.logger.debug('No token provided');
            return false;
          }
      
          // Verify token hasn't expired
          const payload = await this.jwtService.verifyToken(token);
          
          // Check token expiration with buffer time to avoid edge cases
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp - this.AUTH_TOKEN_EXPIRY_BUFFER < currentTime) {
            this.logger.debug(`Token expiring soon: ${payload.exp - currentTime}s remaining`);
          }
          
          // Find and verify the user exists and is active
          const user = await this.usersService.findOneBy({ 
            id: payload.sub
          });
          
          if (!user) {
            this.logger.debug(`User not found or inactive: ${payload.sub}`);
            return false;
          }
          
          // Store minimal user data on socket
          client.user = payload;
          
          // Track connection with timestamp
          client.connectionId = `${user.id}-${Date.now()}`;
          client.handshake.auth.connectedAt = Date.now();
          
          return true;
        } catch (error) {
          this.handleError('Authentication', error);
          return false;
        }
    }

    // Helper method to extract token from socket connection
    private extractTokenFromSocket(client: AuthenticatedSocket): string | null {
        // const origin = client.handshake.headers.origin;
        // // log origin
        // const allowedOrigins = this.configService.get<string[]>('cors.origins', []);
        // if (!origin || !allowedOrigins.includes(origin)) {
        //     this.logger.warn(`Connection attempt from unauthorized origin: ${origin}`);
        //     return null;
        // }
        
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
            
            const user = client.user.email || client.user.sub;
            if (!this.userRooms.has(user)) {
                this.userRooms.set(user, new Set<string>());
            }
            
            const userRoomSet = this.userRooms.get(user)!;
            userRoomSet.add(room);
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

            const user = client.user.email || client.user.sub;
            const rooms = this.userRooms.get(user);
            if (rooms) {
                rooms.delete(room);
            }
            
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
    
    // Messaging Methods
    public pingUser(userId: string): void {
        this.emitToUser({ event: 'ping' }, userId);
    }

    public pingAll(): void {
        this.broadcast(this.namespace, { event: 'ping' });
    }

    public emitToUser(data: any, userId?: string): void {
        if (!userId || !this.connectedClients.has(userId)) {
            this.logger.warn(`User ${userId} not connected`);
            return;
        }

        const userRoom = `user:${userId}:${this.namespace}`;
        this.emitToRoom(userRoom, this.namespace, data);
    }

    public emitToRoom(room: string, event: string, data: any): void {
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
    
    public broadcast(event: string, data: any, exceptUser?: string): void {
        try {
            if (exceptUser) {
                // Send to all clients except the one with exceptUserId
                for (const [userId, client] of this.connectedClients.entries()) {
                    if (userId !== exceptUser) {
                        client.emit(event, data);
                    }
                }
            } else {
                // Send to all clients
                this.server.emit(event, data);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Error broadcasting: ${error.message}`, error.stack);
                throw new WsException(`Failed to broadcast: ${error.message}`);
            } else {
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
        const now = Date.now();
        
        // Check each connection for activity
        this.connectedClients.forEach((client, user) => {
            if (!client.connected) {
            this.logger.debug(`Removing disconnected client: ${user}`);
            this.connectedClients.delete(user);
            return;
            }
            
            // Check for timeout (no activity for X minutes)
            const connectedAt = client.handshake.auth.connectedAt || 0;
            if (now - connectedAt > this.CONNECTION_TIMEOUT) {
            this.logger.debug(`Connection timeout for user: ${user}`);
            client.disconnect(true);
            this.connectedClients.delete(user);
            }
        });
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
                            if (!socket.user || !socket.user.sub) {
                                socket.emit('error', { message: 'Not authenticated' });
                                return;
                            }
                            
                            // Check rate limiting
                            if (this.isRateLimited(socket.user.sub)) {
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
    protected afterConnect(client: AuthenticatedSocket): void {
        if (client.user) {
            const userRoom = `user:${client.user.sub}:${this.namespace}`;
            this.joinRoom(client, userRoom);
            
            this.logger.log(`${client.user.email} subscribed to ${this.namespace}`);
        }
    }
    protected afterDisconnect(client: AuthenticatedSocket): void {}
}