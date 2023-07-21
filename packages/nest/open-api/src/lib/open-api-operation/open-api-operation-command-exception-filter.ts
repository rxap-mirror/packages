import {
  ArgumentsHost,
  Catch,
  Inject,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { IsDevMode } from '@rxap/nest-utilities';
import { OpenApiOperationCommandException } from './open-api-operation-command-exception';

@Catch(OpenApiOperationCommandException)
export class OpenApiOperationCommandExceptionFilter extends BaseExceptionFilter {

  @Inject(Logger)
  private readonly logger?: Logger;

  override catch(exception: OpenApiOperationCommandException, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const { response, config, operation, message } = exception;

    const operationId: string = operation.operationId!;

    switch (response.status) {

      case 404:
        ctx.getResponse<Response>()
           .status(404)
           .json(this.buildExceptionBody(exception));
        break;

      case 401:
        ctx.getResponse<Response>()
           .status(401)
           .json(this.buildExceptionBody(exception));
        break;

      case 403:
        ctx.getResponse<Response>()
           .status(403)
           .json(this.buildExceptionBody(exception));
        break;

      case 409:
        ctx.getResponse<Response>()
           .status(409)
           .json(this.buildExceptionBody(exception));
        break;

      default:
        if (IsDevMode()) {
          ctx.getResponse<Response>().status(500).json({
            statusCode: 500,
            upstreamStatusCode: response.status,
            operationId,
            config,
            message,
          });
        } else {
          ctx.getResponse<Response>().status(500).json({
            statusCode: 500,
            upstreamStatusCode: response.status,
            operationId,
            message,
          });
        }

    }
  }

  private extractEurogardError(message: string) {
    const match = message.match(/e_(\d+)#(.*)/);
    if (match) {
      const code = Number(match[1]);
      const message = match[2];
      return { code, message };
    }
    return null;
  }

  private buildExceptionBody({ response, config, operation, message, serverId }: OpenApiOperationCommandException) {
    const body: Record<string, any> = {};

    body['statusCode'] = response.status;
    body['message'] = message;
    body['operationId'] = operation.operationId;
    body['serverId'] = serverId;
    body['error'] = this.extractEurogardError(message);

    return body;
  }

}
