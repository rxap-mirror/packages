import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { RequestWithJwt } from './types';

export const UserSub = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithJwt>();
    if (!request.jwt) {
      throw new InternalServerErrorException('Missing jwt in request');
    }
    return request.jwt.sub;
  },
);
