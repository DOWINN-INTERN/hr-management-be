import { AuthenticatedSocket, BaseGateway } from '@/common/gateways/base.gateway';
import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway } from '@nestjs/websockets';
import { NotificationsService } from '../notifications.service';

@WebSocketGateway({ namespace: 'notifications', cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true } })
@Injectable()
export class NotificationsGateway extends BaseGateway {
  // Fulfill abstract properties from BaseGateway
  protected namespace = 'notifications';
  
  // Define event handlers map
  protected eventHandlers = new Map<string, (client: AuthenticatedSocket, payload: any) => void>([

  ]);
  
  constructor(
    jwtService: JwtService,
    usersService: UsersService,
    configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(jwtService, usersService, configService);
  }
}