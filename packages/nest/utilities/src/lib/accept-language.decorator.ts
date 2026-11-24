import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import type { Request } from 'express';

export const AcceptLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.acceptsLanguages().shift();
  },
);

export const AcceptLanguages = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.acceptsLanguages();
  },
);
