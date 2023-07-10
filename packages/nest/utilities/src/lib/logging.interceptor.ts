import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import {
  Observable,
  tap,
} from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  @Inject(Logger)
  private readonly logger!: Logger;

  intercept(context: ExecutionContext, next: CallHandler<Response>): Observable<any> {
    const classType = context.getClass();

    if (classType.name === 'HealthController') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    this.logger.debug(`${request.method.toUpperCase()} ${request.url}`, classType.name);

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap({
          next: (body: any) => {
            this.logger.debug(`SUCCESS ${request.method.toUpperCase()} ${request.url} +${Date.now() - now}ms`, classType.name);
            if (body) {
              this.logger.verbose(`RESPONSE ${JSON.stringify(body)}`, classType.name);
            } else {
              this.logger.verbose(`RESPONSE <empty>`, classType.name);
            }
          },
          error: (error: any) => {
            this.logger.debug(`FAILURE ${error.message} ${request.url} +${Date.now() - now}ms`, classType.name);
          },
        }),
      );
  }

}
