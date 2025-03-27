import { IJwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    if (!this.jwtService.validatePayload(payload)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userService.findOneBy({ id: payload.sub });

    if (!user)
      throw new UnauthorizedException('User not found');

    return payload;
  }
}