import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedSocket } from '../gateways/base.gateway';


@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<AuthenticatedSocket>();
      const token = this.extractTokenFromSocket(client);
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify and decode the token
      const payload = await this.jwtService.verifyToken(token);
      
      // Validate payload structure
      if (!this.jwtService.validatePayload(payload)) {
        throw new UnauthorizedException('Invalid token payload');
      }
      
      // Check if user exists
      const user = await this.usersService.findOneBy({ id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Attach user information to socket for later use
      client.user = {
        id: user.id,
        email: payload.email,
        roles: payload.roles,
        departments: payload.departments,
        organizations: payload.organizations,
        branches: payload.branches,
      };
      
      // Generate connection ID
      client.connectionId = `${user.id}-${Date.now()}`;
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromSocket(client: AuthenticatedSocket): string | null {
    // Try to get from handshake auth
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get from query parameters
    const { token } = client.handshake.query;
    if (token && typeof token === 'string') {
      return token;
    }
    
    return null;
  }
}