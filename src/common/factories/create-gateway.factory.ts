import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
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
      jwtService: JwtService,
      usersService: UsersService,
      configService: ConfigService,
    ) {
      super(jwtService, usersService, configService);
    }
  }

  return DynamicGateway;
}