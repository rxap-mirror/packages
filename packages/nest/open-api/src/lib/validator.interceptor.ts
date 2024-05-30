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

  /**
   * Intercepts the execution of a method and performs validation on the response body.
   * If the class type of the execution context is 'HealthController' or 'AppController',
   * the method execution continues without any validation.
   * Otherwise, the method first retrieves the HTTP request from the execution context,
   * then executes the next handler and intercepts the response body.
   * If the response body is not null, it performs validation on it using the `validateSync` method.
   * If validation fails, it logs an error message, logs the response body, and throws a `ValidationHttpException`.
   *
   * @param {ExecutionContext} context - The execution context of the intercepted method.
   * @param {CallHandler<Response>} next - The next handler in the execution chain.
   * @returns {Observable<any>} - An observable that emits the response or throws a `ValidationHttpException`.
   */
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
