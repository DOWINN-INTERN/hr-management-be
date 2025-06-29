import { GoogleAuthGuard } from '@/common/guards/google-auth.guard';
import { EmailsModule } from '@/modules/emails/emails.module';
import { PermissionsModule } from '@/modules/employee-management/roles/permissions/permissions.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './services/jwt.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SessionsModule,
    PermissionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: `${configService.get<string>('ACCESS_TOKEN_EXPIRATION_MINUTES')}m` },
      }),
    }),
    EmailsModule,
  ],
  providers: [AuthService, JwtService, AccessTokenStrategy, GoogleStrategy, JwtAuthGuard, GoogleAuthGuard, PermissionsGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
