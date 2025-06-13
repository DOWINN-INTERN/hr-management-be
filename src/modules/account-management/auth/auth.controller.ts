import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiCreateResponses, ApiGenericResponses } from '@/common/decorators/generic-api-responses.decorator';
import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { IJwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Body, Controller, Get, Logger, ParseUUIDPipe, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from '../../../common/guards/google-auth.guard';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { TokenDto } from './dto/token.dto';
import { ISocialUser } from './interfaces/social-user.interface';

@ApiTags('Auth')
@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly usersService: UsersService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 200, description: 'Redirect to Google login.' })
  async googleOAuth() {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    description: 'User login credentials',
    type: LoginUserDto,
    required: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials', type: GeneralResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not active', type: GeneralResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input', type: GeneralResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found - User not found', type: GeneralResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: GeneralResponseDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully.', type: LoginResponseDto })
  async login(
    @Body() loginDto: LoginUserDto, 
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const login = await this.authService.loginUser(loginDto, request);
    await this.authService.setAuthCookies(response, login);
    return login;
  }

  @Post('verify-email')
  @ApiOperation({ 
    summary: 'Verify user email address',
    description: 'Validates the verification token and marks the user\'s email as verified if valid'
  })
  @ApiBody({
    description: 'Verification token received in the email',
    type: TokenDto,
    required: true,
    examples: {
      example1: {
        value: { token: 'your-verification-token' },
        description: 'Example of a verification token',
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully', 
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired verification token', 
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found', 
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error', 
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User is not active', 
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials', 
    type: GeneralResponseDto
  })
  async verifyEmail(@Body() body: TokenDto): Promise<Partial<GeneralResponseDto>> {
    const result = await this.authService.verifyEmail(body.token);
    
    return {
      statusCode: result ? 200 : 400,
      message: result 
        ? 'Email verified successfully' 
        : 'Invalid or expired verification token',
    };
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully.' })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({
    description: 'Email address to resend verification link',
    type: TokenDto,
    required: true,
    examples: {
      example1: {
        value: { email: 'jyrrahcc@gmail.com' },
        description: 'Example of an email address',
      },
    },
  })
  async resendVerification(@Body() body: { email: string }): Promise<Partial<GeneralResponseDto>> {
    const user = await this.usersService.findOneByOrFail({ email: body.email });
    
    if (user.emailVerified) {
      return {
        message: 'Email is already verified',
      };
    }
    
    const result = await this.authService.sendVerificationEmail(user);
    
    return {
      message: result 
        ? 'Verification email sent successfully' 
        : 'Failed to send verification email',
    };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'User logged in with Google successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    try {
      const socialUser = request.user as ISocialUser;
      if (!socialUser) {
        throw new UnauthorizedException('Authentication failed');
      }
      
      const tokens = await this.authService.googleOAuth(socialUser);
      await this.authService.setAuthCookies(response, tokens);
      
      // Redirect to frontend with success
      const redirectUrl = new URL(`${this.configService.get('APP_URL')}/login`);
      redirectUrl.searchParams.set('auth', 'success');
      return response.redirect(redirectUrl.toString());
    } catch (error: any) {
      this.logger.error(`Google OAuth callback failed: ${error.message}`);
      
      // Redirect to frontend with error
      const redirectUrl = new URL(`${this.configService.get('APP_URL')}/login`);
      redirectUrl.searchParams.set('auth', 'failed');
      redirectUrl.searchParams.set('error', 'Authentication failed');
      return response.redirect(redirectUrl.toString());
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { 
          type: 'string',
          description: 'Refresh token (optional if provided in cookies)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Access token refreshed successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Refresh token not found or invalid' })
  async refreshToken(
    @Body('refreshToken', ParseUUIDPipe) bodyRefreshToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // Get refresh token from cookies or request body
    const refreshToken = 
      request.cookies?.refreshToken || 
      bodyRefreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    const tokens = await this.authService.refreshTokens(refreshToken, request);
    await this.authService.setAuthCookies(response, tokens);
    return tokens;
  }
  
  @Post('logout')
  @Authorize()
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { 
          type: 'string',
          description: 'Refresh token (optional if provided in cookies)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Refresh token not found or invalid' })
  async logout(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // Get refresh token from cookies or request body
    const refreshToken = 
      request.cookies?.refreshToken || 
      bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
      
    await this.authService.logoutUser(refreshToken, response);
    
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'User registration details',
    type: RegisterUserDto,
    required: true,
  })
  @ApiCreateResponses('User', GeneralResponseDto)
  @ApiGenericResponses()
  async register(@Body() registerDto: RegisterUserDto): Promise<Partial<GeneralResponseDto>> {
    await this.authService.registerUser(registerDto);
    return {
      statusCode: 201,
      message: 'Account created successfully. Please check your email to verify your account.',
    };
  }

  // @Get('google')
  // @UseGuards(GoogleAuthGuard)
  // @ApiOperation({ summary: 'Login with Google' })
  // @ApiResponse({ status: 200, description: 'Redirect to Google login.' })
  // async googleAuth(@Request() req) {}

  // @Get('google/redirect')
  // @UseGuards(GoogleAuthGuard)
  // @ApiOperation({ summary: 'Google login redirect' })
  // @ApiResponse({ status: 200, description: 'User logged in with Google successfully.' })
  // googleAuthRedirect(@Request() req) {
  //   return this.authService.googleLogin(req);
  // }

  @Get('me')
  @Authorize()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return authenticated user details',
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid token',
    type: GeneralResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden',
    type: GeneralResponseDto
  })
  getCurrentUser(@CurrentUser() user: IJwtPayload) {
    return user;
  }

  // @Post('send-recovery-code')
  // @ApiOperation({ summary: 'Send password recovery code' })
  // @ApiResponse({ status: 200, description: 'Recovery code sent successfully.' })
  // async sendRecoveryCode(@Body('email') email: string) {
  //   return this.authService.sendRecoveryCode(email);
  // }

  // @Post('reset-password')
  // @ApiOperation({ summary: 'Reset password' })
  // @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  //   return this.authService.resetPassword(
  //     resetPasswordDto.email,
  //     resetPasswordDto.newPassword,
  //     resetPasswordDto.recoveryCode,
  //   );
  // }
}
