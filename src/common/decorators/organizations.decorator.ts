import { SetMetadata } from '@nestjs/common';
export const ORGANIZATIONS_KEY = 'organizations';

/**
 * A decorator that assigns organizations to a route handler or controller.
 * 
 * @param {...string[]} organizations - The organizations to be assigned.
 * 
 * @returns {CustomDecorator<string>} - A custom decorator that sets metadata for the organizations.
 * 
 * @example
 * ```typescript
 * import { Organizations } from './organizations.decorator';
 * 
 * @Organizations('org1', 'org2')
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   findAll() {
 *     // This route can be accessed by users belonging to 'org1' or 'org2'.
 *   }
 * }
 * ```
 */
export const Organizations = (...organizations: string[]) => SetMetadata(ORGANIZATIONS_KEY, organizations);