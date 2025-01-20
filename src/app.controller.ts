import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register')
  register(@Body() registerDto: any): string {
    // Registration logic will be handled in the AuthService
    return 'User registered';
  }

  @Post('login')
  login(@Body() loginDto: any): string {
    // Login logic will be handled in the AuthService
    return 'User logged in';
  }
}