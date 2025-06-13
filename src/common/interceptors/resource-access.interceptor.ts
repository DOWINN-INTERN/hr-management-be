import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilityHelper } from '../helpers/utility.helper';

@Injectable()
export class ResourceAccessInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                const request = context.switchToHttp().getRequest();
                const resourceScope = request.resourceScope;

                // Check access on the returned resource
                if (data && resourceScope) {
                    const hasAccess = UtilityHelper.checkScopeAccess(data, resourceScope);
                    
                    if (!hasAccess) {
                        throw new ForbiddenException(
                            `You do not have access to this resource`,
                        );
                    }
                }

                return data;
            })
        );
    }
}