import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { UserConnectionService } from '@/modules/notifications/services/user-connection.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../gateways/base.gateway';

export function createGateway(namespace: string) {
  @WebSocketGateway({ namespace })
  @Injectable()
  class DynamicGateway extends BaseGateway {
    protected namespace = namespace;
    
    constructor(
      protected readonly userConnectionService: UserConnectionService,
      protected readonly jwtService: JwtService,
      protected readonly usersService: UsersService,
      protected readonly configService: ConfigService,
    ) {
      super(userConnectionService, jwtService, usersService, configService);
    }
  }

  return DynamicGateway;
}