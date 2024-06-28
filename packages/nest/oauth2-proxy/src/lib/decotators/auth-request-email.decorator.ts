import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import { coerceArray } from '@rxap/utilities';

export const AuthRequestEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<any>();
    const header = coerceArray(request.headers['x-auth-request-email']);
    if (!header.length) {
      throw new BadRequestException('Missing x-auth-request-email header');
    }
    if (header.length > 1) {
      throw new BadRequestException('Multiple x-auth-request-email headers found');
    }
    return header[0];
  }
);
