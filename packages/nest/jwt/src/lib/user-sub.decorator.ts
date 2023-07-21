import { RequestWithJwt } from './types';
import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const UserSub = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithJwt>();
    return request.jwt.sub;
  },
);
