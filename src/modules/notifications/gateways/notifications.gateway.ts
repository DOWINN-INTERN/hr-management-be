import { BaseGateway } from '@/common/gateways/base.gateway';
import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'notifications' })
@Injectable()
export class NotificationsGateway extends BaseGateway {
  protected namespace = 'notifications';
  
  constructor(
    jwtService: JwtService,
    usersService: UsersService,
    configService: ConfigService,
  ) {
    super(jwtService, usersService, configService);
  }
}