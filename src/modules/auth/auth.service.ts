import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../../email/email.service';
import { recoveryEmailTemplate } from '../../email/email-templates';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: Partial<User>): Promise<User> {
    const existingUser = await this.usersService.findOne(user.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    user.password = await bcrypt.hash(user.password, 10);
    return this.usersService.create(user);
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    const payload = { email: req.user.email, sub: req.user.id, role: req.user.role };
    return {
      message: 'User information from google',
      user: req.user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendRecoveryCode(email: string): Promise<void> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const recoveryCode = uuidv4().split('-')[0];
    user.recoveryCode = recoveryCode;
    await this.usersService.update(user.id, user);

    const emailContent = recoveryEmailTemplate(recoveryCode);
    await this.emailService.sendMail(email, 'Password Recovery', '', emailContent);
  }

  async resetPassword(email: string, newPassword: string, recoveryCode: string): Promise<void> {
    const user = await this.usersService.findOne(email);
    if (!user || user.recoveryCode !== recoveryCode) {
      throw new UnauthorizedException('Invalid recovery code');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.recoveryCode = null;
    await this.usersService.update(user.id, user);
  }
}
