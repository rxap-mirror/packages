import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { RequestWithJwt } from './types';

export const UserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithJwt>();
    if (!('jwt' in request || 'user' in request)) {
      throw new InternalServerErrorException('Missing jwt or user property in request object');
    }
    let jwt: any;
    if ('jwt' in request) {
      jwt = request.jwt;
    }
    if ('user' in request) {
      jwt = request.user;
    }
    if (!('email' in jwt)) {
      throw new InternalServerErrorException('The decoded jwt token is missing the email claim');
    }
    return jwt.sub;
  },
);
