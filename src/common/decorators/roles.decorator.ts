import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const ONLY_ALLOW_ROLES_KEY = 'onlyAllowRoles';
export const ALLOW_EMPLOYEE_KEY = 'allowEmployee';
/**
 * Decorator that assigns roles to a route or controller.
 * This metadata can be used with a guard to control access to specific endpoints.
 *
 * @param roles - An array of role names that are allowed to access the decorated endpoint.
 * Defaults to an empty array if not provided.
 * @returns A decorator function that sets the roles metadata on the target.
 *
 * @example
 * ```typescript
 * // Apply to a controller to restrict all routes
 * @Controller('users')
 * @Roles(['admin'])
 * export class UsersController {
 *   // ...
 * }
 *
 * // Apply to a specific route
 * @Get('profile')
 * @Roles(['admin', 'user'])
 * getProfile() {
 *   return 'This is a protected route';
 * }
 * ```
 */
export const Roles = (roles: string[] = []) => SetMetadata(ROLES_KEY, roles);
export const OnlyAllowRoles = (onlyAllowRoles: boolean = true) => SetMetadata(ONLY_ALLOW_ROLES_KEY, onlyAllowRoles);
export const AllowEmployee = (allowEmployee: boolean = false) => SetMetadata(ALLOW_EMPLOYEE_KEY, allowEmployee);