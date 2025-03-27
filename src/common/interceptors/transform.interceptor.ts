import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

/**
 * A NestJS interceptor that transforms the response data.
 * 
 * This interceptor converts class instances in the response to plain JavaScript objects
 * using the `instanceToPlain` function from class-transformer.
 * It's particularly useful when working with class-transformer decorated entities
 * to ensure proper serialization of response data.
 * 
 * @implements {NestInterceptor}
 * 
 * @example
 * ```typescript
 * @UseInterceptors(TransformInterceptor)
 * @Get()
 * findAll() {
 *   return this.service.findAll();
 * }
 * ```
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(map((data) => instanceToPlain(data)));
  }
}
