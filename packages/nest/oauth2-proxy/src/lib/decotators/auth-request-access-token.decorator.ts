import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { coerceArray } from '@rxap/utilities';

export const AuthRequestAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<any>();
    const header = coerceArray(request.headers['x-auth-request-access-token']);
    if (!header.length) {
      throw new BadRequestException('Missing x-auth-request-access-token header');
    }
    if (header.length > 1) {
      throw new BadRequestException('Multiple x-auth-request-access-token headers found');
    }
    return header[0];
  }
);
