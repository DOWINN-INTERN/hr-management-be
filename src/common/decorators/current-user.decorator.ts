import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
/**
 * Custom decorator to extract the current user from the request.
 * 
 * @param data - The specific key of the user object to extract. If undefined, the entire user object is returned.
 * @param context - The execution context which provides access to the request object.
 * 
 * @returns The user object or a specific property of the user object.
 * 
 * @throws {UnauthorizedException} If the user is not authenticated.
 * 
 * @example
 * // Usage in a controller to get the entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * @example
 * Usage in a controller to get a specific property of the user object
 * @Get('profile/email')
 * getEmail(@CurrentUser('email') email: string) {
 *   return email;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof IJwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user) {
      throw new UnauthorizedException('User claims is missing.');
    }

    if (!data) {
      return request.user;
    }

    return request?.user[data];
  },
);