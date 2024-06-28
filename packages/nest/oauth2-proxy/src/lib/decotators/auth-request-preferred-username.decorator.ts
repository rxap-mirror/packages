import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import { coerceArray } from '@rxap/utilities';

export const AuthRequestPreferredUsername = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<any>();
    const header = coerceArray(request.headers['x-auth-request-preferred-username']);
    if (!header.length) {
      throw new BadRequestException('Missing x-auth-request-preferred-username header');
    }
    if (header.length > 1) {
      throw new BadRequestException('Multiple x-auth-request-preferred-username headers found');
    }
    return header[0];
  }
);
