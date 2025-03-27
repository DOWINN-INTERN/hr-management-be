import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { ISocialUser } from "../interfaces/social-user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-auth') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService, private authService: AuthService) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email']
    });
  }
  
  authorizationParams(): { [key: string]: string } {
    return {
      prompt: 'select_account',
      access_type: 'offline', // To get refresh token
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {

    try {
        this.logger.debug(`Validating Google user: ${profile.id}`);
        
        // Validate required profile data
        if (!profile || !profile.emails || profile.emails.length === 0) {
          this.logger.error('Invalid profile data received from Google');
          throw new UnauthorizedException('Invalid profile data from Google');
        }
  
        const email = profile.emails[0].value;
        if (!email) {
          this.logger.error('Email not provided by Google OAuth');
          throw new UnauthorizedException('Email is required');
        }
  
        // Extract user data from Google profile
        const user: ISocialUser = {
          provider: 'google',
          providerId: profile.id,
          email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          picture: profile.photos?.[0]?.value || '',
          accessToken,
          refreshToken: refreshToken || '', // Refresh token might be undefined if not requested properly
        };
          
        // Validate and persist the user in your system
        // const savedUser = await this.authService.validateSocialUser(user);
        
        // if (!savedUser) {
        //   this.logger.error(`Failed to validate/save Google user: ${email}`);
        //   throw new UnauthorizedException('Authentication failed');
        // }
        
        this.logger.log(`Google user authenticated successfully: ${email}`);
        done(null, false);
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Google authentication failed: ${error.message}`, error.stack);
        } else {
          this.logger.error(`Google authentication failed: ${String(error)}`);
        }
        done(error, false);
      }
  }
}