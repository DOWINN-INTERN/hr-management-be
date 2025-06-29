import { UtilityHelper } from '@/common/helpers/utility.helper';
import { CommonService } from '@/common/services/common.service';
import { EmailsService } from '@/modules/emails/emails.service';
import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ISocialUser } from './interfaces/social-user.interface';
import { JwtService } from './services/jwt.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly VERIFICATION_TOKEN_EXPIRATION_HOURS = 24; // 24 hours

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
    private readonly sessionsService: SessionsService,
    private readonly emailsService: EmailsService,
  ) {}

  private readonly commonCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: this.commonService.isProduction(),
    // sameSite: 'lax',
    maxAge: this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRATION_MINUTES') * 60 * 1000,
  };

  async googleOAuth(socialUser: ISocialUser): Promise<LoginResponseDto> {
    const { email, providerId, firstName, lastName, picture } = socialUser;
    
    this.logger.log(`Processing OAuth login for ${email}`);
    
    // Find user by email or create if not exists
    let user = await this.usersService.findOneBy({ email });
    
    if (!user) {
      // Create a new user with data from Google
      const newUser = await this.usersService.create({
        email,
        profile: {
          firstName: firstName || '',
          lastName: lastName || '',
          profilePicture: picture || '',
        },
        emailVerified: true, // Social logins are considered verified
        password: await bcrypt.hash(uuidv4(), 10), // Generate random password
      });
      
      user = await this.usersService.save(newUser) as User;
      
      this.logger.log(`Created new user from Google OAuth: ${user.id}`);
    } else {
      // Update user information if needed
      let needsUpdate = false;
      
      if (!user.profile?.firstName && firstName) {
        user.profile!.firstName = firstName;
        needsUpdate = true;
      }
      
      if (!user.profile?.lastName && lastName) {
        user.profile!.lastName = lastName;
        needsUpdate = true;
      }
      
      if (!user.profile?.profilePicture && picture) {
        user.profile!.profilePicture = picture;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await this.usersService.save(user);
      }
    }
    
    // Create refresh token and access token
    const refreshToken = await this.jwtService.createRefreshToken();
    const payload = this.jwtService.createPayload(user, refreshToken);
    const accessToken = await this.jwtService.createToken(payload);
    
    // Save session information
    await this.sessionsService.create({
      refreshToken,
      user: { id: user.id },
      expiresAt: new Date(Date.now() + this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES') * 60 * 1000),
      userAgent: 'Google OAuth',
      ipAddress: 'OAuth Flow'
    });
    
    return {
      accessToken,
    };
  }

  // Add this method for sending verification emails
  async sendVerificationEmail(user: User): Promise<boolean> {
    // Generate verification token (you may want to store this in the user record)
    const verificationToken = uuidv4();
    
    // Store the token in the user record with an expiration
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000); // 24 hours
    await this.usersService.update(user.id, user);
    
    // Build verification URL
    const baseUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    // Send the email
    return this.emailsService.sendTemplatedEmail(
      user.email,
      'email-verification',
      {
        firstName: user.profile?.firstName || 'User',
        lastName: user.profile?.lastName,
        verificationUrl,
        expiry: this.VERIFICATION_TOKEN_EXPIRATION_HOURS,
      }
    );
  }

  async validateUser(model: LoginUserDto): Promise<User | null> {
    // check if emailOrUserName property is an email
    var user: User | null = null;
    if (UtilityHelper.isEmail(model.emailOrUserName)) {
      // check if email exists
      user = await this.usersService.findOneBy({ email: model.emailOrUserName.toLowerCase().trim() }, { relations: { employee: { roles: { organization: true, branch: true, department: true } } } });
        
      if (!user) {
        return null;
      }
    }
    else {
      // check if username exists
      user = await this.usersService.findOneBy({ userName: model.emailOrUserName.toLowerCase().trim() }, { relations: { employee: { roles: { organization: true, branch: true, department: true } } } });
      if (!user) {
        return null;
      }
    }

    if (!user || !(await bcrypt.compare(model.password, user.password))) {
      return null;
    }

    return user;
  }

  //   /**
  //  * Validates a user from social authentication providers (Google, Facebook, etc.)
  //  * Handles user creation, updates, and generates authentication tokens.
  //  * 
  //  * @param socialUser User data received from the OAuth provider
  //  * @returns User entity with tokens
  //  */
  // async validateSocialUser(socialUser: ISocialUser): Promise<any> {
  //   const { email, provider, providerId, firstName, lastName, picture } = socialUser;
    
  //   this.logger.log(`Validating social user: ${email} from ${provider}`);
    
  //   // Start a transaction to ensure data consistency
  //   return await this.transactionService.executeInTransaction(async (manager) => {
  //     const userRepository = manager. y(User);
      
  //     // Try to find existing user by email
  //     let user = await userRepository.findOne({ 
  //       where: { email },
  //       relations: ['socialLogins'],
  //     });
      
  //     // Try to find by social provider ID if not found by email
  //     if (!user) {
  //       const socialLoginRepository = manager.getRepository(SocialLogin);
  //       const socialLogin = await socialLoginRepository.findOne({
  //         where: { provider, providerId },
  //         relations: ['user'],
  //       });
        
  //       if (socialLogin) {
  //         user = socialLogin.user;
  //       }
  //     }
      
  //     // If we found a user, update their information
  //     if (user) {
  //       this.logger.log(`Found existing user with email ${email}`);
        
  //       // Check if user is active
  //       if (user.isActive === false) {
  //         this.logger.warn(`User ${email} account is deactivated`);
  //         throw new UnauthorizedException('Your account has been deactivated');
  //       }
        
  //       // Ensure this social login is linked to the user's account
  //       const socialLoginRepository = manager.getRepository(SocialLogin);
  //       let socialLogin = await socialLoginRepository.findOne({
  //         where: { 
  //           user: { id: user.id },
  //           provider,
  //           providerId,
  //         },
  //       });
        
  //       // Link this social provider if not already linked
  //       if (!socialLogin) {
  //         socialLogin = socialLoginRepository.create({
  //           user,
  //           provider,
  //           providerId,
  //           lastLogin: new Date(),
  //         });
  //         await socialLoginRepository.save(socialLogin);
  //         this.logger.log(`Linked ${provider} account to existing user ${email}`);
  //       } else {
  //         // Update last login time
  //         socialLogin.lastLogin = new Date();
  //         await socialLoginRepository.save(socialLogin);
  //       }
  //     } 
  //     // Create new user if not found
  //     else {
  //       this.logger.log(`Creating new user for ${email} from ${provider}`);
        
  //       // Create user with data from social profile
  //       user = userRepository.create({
  //         email,
  //         firstName: firstName || '',
  //         lastName: lastName || '',
  //         profileImage: picture,
  //         isEmailVerified: true, // Social logins are considered verified
  //         lastLoginAt: new Date(),
  //       });
        
  //       // Try to auto-assign default role (e.g., "user")
  //       try {
  //         const roleRepository = manager.getRepository(Role);
  //         const userRole = await roleRepository.findOne({ 
  //           where: { name: 'user' } 
  //         });
          
  //         if (userRole) {
  //           user.roles = [userRole];
  //         }
  //       } catch (error) {
  //         this.logger.warn(`Could not assign default role to new user: ${error.message}`);
  //       }
        
  //       // Save the new user
  //       user = await userRepository.save(user);
        
  //       // Create social login record
  //       const socialLoginRepository = manager.getRepository(SocialLogin);
  //       const socialLogin = socialLoginRepository.create({
  //         user,
  //         provider,
  //         providerId,
  //         lastLogin: new Date(),
  //       });
  //       await socialLoginRepository.save(socialLogin);
  //     }
      
  //     // Update profile information if missing or incomplete
  //     let needsUpdate = false;
      
  //     if (!user.firstName && firstName) {
  //       user.firstName = firstName;
  //       needsUpdate = true;
  //     }
      
  //     if (!user.lastName && lastName) {
  //       user.lastName = lastName;
  //       needsUpdate = true;
  //     }
      
  //     if (!user.profileImage && picture) {
  //       user.profileImage = picture;
  //       needsUpdate = true;
  //     }
      
  //     if (needsUpdate) {
  //       await userRepository.save(user);
  //     }
      
  //     // Generate tokens for the user
  //     const tokens = await this.jwtService.generateTokens(user);
      
  //     // Return user with tokens
  //     return {
  //       user: this.usersService.sanitizeUser(user),
  //       ...tokens
  //     };
  //   });
  // }

  async registerUser(model: RegisterUserDto): Promise<User> {
    // check if user already exists
    const existingEmail = await this.usersService.findOneBy({ email: model.email.toLowerCase().trim() });

    const existingUserName = await this.usersService.findOneBy({ userName: model.userName.toLowerCase().trim() });

    if (existingEmail) {
      // throw error if user already exists
      throw new ConflictException('Email is already used by another user.');
    }

    if (existingUserName) {
      // throw error if user already exists
      throw new ConflictException('Username is already used by another user.');
    }

    // create new user
    const user = await this.usersService.signUpUser(model);

    // can be decoupled to an event or queue
    await this.sendVerificationEmail(user).catch((error) => {
      this.logger.error('Failed to send verification email', error);
    });

    return user;
  }

  // Add a method to verify email
  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.usersService.findOneBy({ verificationToken: token });
    
    if (!user || !user.verificationTokenExpires) {
      return false;
    }
    
    // Check if token is expired
    if (user.verificationTokenExpires < new Date()) {
      return false;
    }
    
    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await this.usersService.update(user.id, user);
    
    // Optionally send welcome email
    // can be decoupled
    this.emailsService.sendTemplatedEmail(
      user.email,
      'welcome',
      {
        firstName: user.profile?.firstName || 'User',
        lastName: user.profile?.lastName,
        appName: this.configService.getOrThrow<string>('APP_NAME'),
      }
    ).catch(error => {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    });
    
    return true;
  }

  clearAuthCookies(response: Response): Response {
    response.clearCookie('accessToken', this.commonCookieOptions);
    response.clearCookie('refreshToken', this.commonCookieOptions);
    return response;
  }

  setAuthCookies(response: Response, tokens: LoginResponseDto): void {
    const accessTokenExpirationMinutes = this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRATION_MINUTES');
    const refreshTokenExpirationMinutes = this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES');
    // Set access token cookie
    response.cookie('accessToken', tokens.accessToken, {
      ...this.commonCookieOptions,
      maxAge: accessTokenExpirationMinutes * 60 * 1000,
    });
  
    // response.cookie('refreshToken', tokens.refreshToken, {
    //   ...this.commonCookieOptions,
    //   maxAge: refreshTokenExpirationMinutes * 60 * 1000,
    // });
  }

  async logoutUser(refreshToken: string, response: Response): Promise<void> {  
    // Find the session with this refresh token
    const session = await this.sessionsService.findOneBy({ refreshToken });
    if (session) {
      // Update last active instead of deleting
      await this.sessionsService.update(session.id, { 
        lastActiveAt: new Date(),
      });
    }

    // Clear auth cookies
    this.clearAuthCookies(response);
  }

  async refreshTokens(refreshToken: string, request?: Request): Promise<LoginResponseDto> {
    const session = await this.sessionsService.findOneBy(
      { refreshToken },
      {
        relations: { 
          user: { employee: { roles: true } }     // Include nested employee relation
        },
        order: { createdAt: 'DESC' },  // Get the newest session first
      }
    );

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if user exists
    const user = session.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
      
    // Create new tokens
    const newRefreshToken = await this.jwtService.createRefreshToken();
    const newPayload = this.jwtService.createPayload(user, newRefreshToken);
    const accessToken = await this.jwtService.createToken(newPayload);

    // Calculate expiration time for refresh token
    const refreshTokenExpirationMinutes = this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + refreshTokenExpirationMinutes * 2);

    // save refresh token to database
    await this.sessionsService.create({
      refreshToken,
      user: { id: user.id },
      expiresAt,
      userAgent: request?.headers['user-agent'],
      ipAddress: request?.ip,
      deviceId: Array.isArray(request?.headers['device-id']) 
      ? request?.headers['device-id'][0] 
      : request?.headers['device-id'],
    }, user.id);
    
    return {
      accessToken,
    };
  }

  // login user
  async loginUser(model: LoginUserDto, req?: Request): Promise<LoginResponseDto> {
    var user = await this.validateUser(model);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.emailVerified === false) {
      throw new UnauthorizedException('Email not verified');
    }

    const refreshToken = await this.jwtService.createRefreshToken();
    const payload = this.jwtService.createPayload(user, refreshToken);
    const accessToken = await this.jwtService.createToken(payload);

    // Calculate expiration time for refresh token
    const refreshTokenExpirationMinutes = this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + refreshTokenExpirationMinutes * 2);

    // save refresh token to database
    await this.sessionsService.create({
      refreshToken,
      user: { id: user.id },
      expiresAt,
      userAgent: req?.headers['user-agent'],
      ipAddress: req?.ip,
      deviceId: Array.isArray(req?.headers['device-id']) 
      ? req?.headers['device-id'][0] 
      : req?.headers['device-id'],
    }, user.id);


    const response: LoginResponseDto = {
      accessToken,
    };

    return response;
  }

  // async validateUser(email: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOne(email);
  //   if (user && await bcrypt.compare(pass, user.password)) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // async login(user: any) {
  //   const payload = { email: user.email, sub: user.id, role: user.role };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  // async register(user: Partial<User>): Promise<User> {
  //   const existingUser = await this.usersService.findOne(user.email);
  //   if (existingUser) {
  //     throw new UnauthorizedException('User already exists');
  //   }
  //   user.password = await bcrypt.hash(user.password, 10);
  //   return this.usersService.create(user);
  // }

  // async googleLogin(req) {
  //   if (!req.user) {
  //     return 'No user from google';
  //   }

  //   const payload = { email: req.user.email, sub: req.user.id, role: req.user.role };
  //   return {
  //     message: 'User information from google',
  //     user: req.user,
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  // async sendRecoveryCode(email: string): Promise<void> {
  //   const user = await this.usersService.findOne(email);
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }

  //   const recoveryCode = uuidv4().split('-')[0];
  //   user.recoveryCode = recoveryCode;
  //   await this.usersService.update(user.id, user);

  //   const emailContent = recoveryEmailTemplate(recoveryCode);
  //   await this.emailService.sendMail(email, 'Password Recovery', '', emailContent);
  // }

  // async resetPassword(email: string, newPassword: string, recoveryCode: string): Promise<void> {
  //   const user = await this.usersService.findOne(email);
  //   if (!user || user.recoveryCode !== recoveryCode) {
  //     throw new UnauthorizedException('Invalid recovery code');
  //   }

  //   user.password = await bcrypt.hash(newPassword, 10);
  //   user.recoveryCode = null;
  //   await this.usersService.update(user.id, user);
  // }
}
