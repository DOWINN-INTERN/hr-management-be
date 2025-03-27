import { SetMetadata } from "@nestjs/common";
import { IPermission } from "../interfaces/permission.interface";

export const PERMISSIONS_KEY = 'permissions';
/**
 * A decorator to set permissions metadata for a route handler.
 * 
 * @param requirements - An array of permission objects that are required to access the route.
 * @returns A decorator function that sets the permissions metadata.
 * 
 * @example
 * ```typescript
 * import { Permissions } from './permissions.decorator';
 * import { Controller, Get } from '@nestjs/common';
 * 
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   @Permissions([{ name: 'read', level: 'admin' }])
 *   getExample() {
 *     return 'This route requires read permission with admin level';
 *   }
 * }
 * ```
 */
export const Permissions = (requirements: IPermission[] = []) => 
  SetMetadata(PERMISSIONS_KEY, requirements);