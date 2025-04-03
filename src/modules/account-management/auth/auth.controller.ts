import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IJwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from '../../../common/guards/google-auth.guard';
import { GetUserDto } from '../users/dtos/user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleOAuth() {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  async login(
    @Body() loginDto: LoginUserDto, 
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const login = await this.authService.loginUser(loginDto, request);
    await this.authService.setAuthCookies(response, login);
    return login;
  }

  // @Public()
  // @Get('google/redirect')
  // @UseGuards(GoogleOAuthGuard)
  // async googleCallback(@Req() request: Request, @Res() response: Response) {
  //   const redirectUrl = new URL(`${this.commonService.getAppUrl}/login`);
  //   const user = request.user as IUser;
  //   try
  //   {
  //     const tokens: Tokens = await this.authService.googleOAuth(user);
  //     const responseWithCookies = this.authService.setAuthCookies(response, tokens);
  //     redirectUrl.searchParams.set('auth', 'success');
  //     return responseWithCookies.redirect(redirectUrl.toString());
  //   }
  //   catch (error) {
  //     redirectUrl.searchParams.set('auth', 'failed');
  //     return response.redirect(redirectUrl.toString());
  //   }
  // }

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
  @ApiResponse({ status: 401, description: 'Unauthorized - Refresh token not found or invalid' })
  async refreshToken(
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
    
    const tokens = await this.authService.refreshTokens(refreshToken);
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
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  async register(@Body() registerDto: RegisterUserDto): Promise<GetUserDto> {
    return plainToInstance(GetUserDto, this.authService.registerUser(registerDto));
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
    description: 'Return authenticated user details' 
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
