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
import {
  Request,
  Response,
} from 'express';

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

    const requestId = (function randomNum() {
      return Math.floor(Math.random() * 9999999).toFixed(0).padStart(7, '0');
    })();

    this.logger.debug(`[${ requestId }] ${ request.method.toUpperCase() } ${ request.url }`, classType.name);

    if (request.body) {
      this.logger.verbose(`[${ requestId }] REQUEST ${ JSON.stringify(request.body) }`, classType.name);
    }

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap({
          next: (body: any) => {
            this.logger.debug(`[${ requestId }] SUCCESS ${ request.method.toUpperCase() } ${ request.url } +${ Date.now() -
            now }ms`, classType.name);
            if (body) {
              this.logger.verbose(`[${ requestId }] RESPONSE ${ JSON.stringify(body) }`, classType.name);
            } else {
              this.logger.verbose(`[${ requestId }] RESPONSE <empty>`, classType.name);
            }
          },
          error: (error: any) => {
            this.logger.debug(
              `[${ requestId }] FAILURE ${ error.message } ${ request.url } +${ Date.now() - now }ms`,
              classType.name,
            );
          },
        }),
      );
  }

}
