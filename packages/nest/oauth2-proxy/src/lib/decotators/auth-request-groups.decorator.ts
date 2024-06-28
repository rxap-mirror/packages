import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import { coerceArray } from '@rxap/utilities';

export const AuthRequestGroups = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<any>();
    const header = coerceArray(request.headers['x-auth-request-groups']);
    if (!header.length) {
      throw new BadRequestException('Missing x-auth-request-groups header');
    }
    if (header.length > 1) {
      throw new BadRequestException('Multiple x-auth-request-groups headers found');
    }
    return header[0].split(',');
  }
);
