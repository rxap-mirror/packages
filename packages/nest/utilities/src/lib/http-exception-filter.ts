import {ArgumentsHost, Catch, HttpException, Inject, Logger} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {

  @Inject(Logger)
  private readonly logger?: Logger;

  override catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    this.logger?.debug(exception.message, `(${status}) ${request.method.toUpperCase()} ${request.path}`);

    super.catch(exception, host);
  }
}
