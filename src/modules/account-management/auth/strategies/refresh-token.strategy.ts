// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Request } from 'express';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UsersService } from '../../users/users.service';
// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class RefreshTokenStrategy extends PassportStrategy(
//   Strategy,
//   'jwt-refresh',
// ) {
//   constructor(
//     private configService: ConfigService,
//     private usersService: UsersService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           return request?.cookies?.refresh_token;
//         },
//       ]),
//       secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: JwtPayload) {
//     const refreshToken = req.cookies?.refresh_token;
    
//     if (!refreshToken) {
//       throw new UnauthorizedException('Refresh token not found');
//     }
    
//     const user = await this.usersService.findOneBy({id: payload.sub });
    
//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }
    
//     // Here you might want to verify that the refresh token is still valid
//     // e.g., not revoked, by checking against a database record
//     const isValid = await this.usersService.validateRefreshToken(
//       user.id,
//       refreshToken,
//     );
    
//     if (!isValid) {
//       throw new UnauthorizedException('Refresh token is invalid');
//     }
    
//     return {
//       ...payload,
//       refreshToken,
//     };
//   }
// }