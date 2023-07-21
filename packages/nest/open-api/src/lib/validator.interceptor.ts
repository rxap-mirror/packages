import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import {
  Request,
  Response,
} from 'express';
import {
  Observable,
  tap,
} from 'rxjs';
import { validateSync } from 'class-validator';
import {
  ValidationErrorListToString,
  ValidationHttpException,
} from '@rxap/nest-utilities';

@Injectable()
export class ValidatorInterceptor implements NestInterceptor {

  @Inject(Logger)
  private readonly logger!: Logger;

  intercept(context: ExecutionContext, next: CallHandler<Response>): Observable<any> {
    const classType = context.getClass();

    if (classType.name === 'HealthController' || classType.name === 'AppController') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      tap(body => {

        if (body) {
          const resultList = validateSync(body);
          if (resultList.length) {
            this.logger.error(
              `Response for ${ request.url }: ${ ValidationErrorListToString(resultList) }`,
              classType.name,
            );
            this.logger.verbose(JSON.stringify(body), classType.name);
            throw new ValidationHttpException(resultList, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }

      }),
    );
  }

}
