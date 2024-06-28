import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IsJwtPayload,
  IsRequestWithJwt,
  RequestWithJwt,
} from './types';

export const UserSub = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithJwt>();
    if (!IsRequestWithJwt(request)) {
      throw new InternalServerErrorException('Missing jwt in request');
    }
    const jwt = request.jwt;
    if (!IsJwtPayload(jwt)) {
      throw new InternalServerErrorException('Invalid jwt payload');
    }
    return jwt.sub;
  },
);
