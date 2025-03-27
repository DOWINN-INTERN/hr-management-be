import { SetMetadata } from '@nestjs/common';
export const BRANCHES_KEY = 'branches';
/**
 * A decorator that assigns branches to a route handler or controller.
 * 
 * @param {...string[]} branches - The branches to be assigned.
 * 
 * @returns {CustomDecorator<string>} - A custom decorator that sets metadata for the branches.
 * 
 * @example
 * ```typescript
 * import { Branches } from './branches.decorator';
 * 
 * @Branches('branch1', 'branch2')
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   findAll() {
 *     // This route can be accessed by users with 'branch1' or 'branch2' branches.
 *   }
 * }
 * ```
 */
export const Branches = (branches: string[] = []) => SetMetadata(BRANCHES_KEY, branches);