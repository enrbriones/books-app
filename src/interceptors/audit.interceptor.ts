/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;
    console.log('request', request);
    console.log('user', user);

    const shouldLog = ['POST', 'PUT', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(() => {
        if (shouldLog) {
          this.logger.log(
            `[${method}] ${request.originalUrl} by ${user?.email ?? 'anonymous'}`,
          );
        }
      }),
    );
  }
}
