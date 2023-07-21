import { RequestWithUser } from './types';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      throw new InternalServerErrorException('User is not injected into the request. Ensure the UserGuard is used');
    }
    return user;
  },
);
