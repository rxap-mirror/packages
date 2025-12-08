import { Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncContext } from '@nestjs/cqrs';
import {
  isRequestWithUser,
  isRequestWithUserSub,
} from '@rxap/nest-jwt';
import { Request } from 'express';
import { USER_ID } from './token';
import { UserContext } from './user.context';

export function userIdFactory(request: Request | AsyncContext): string {
  if (request instanceof AsyncContext) {
    if (request instanceof UserContext) {
      return request.userId;
    }
    if ('userId' in request) {
      const userId = request.userId;
      if (typeof userId === 'string') {
        return userId;
      } else {
        throw new Error('The injected REQUEST is an AsyncContext with a userId that is not a string.');
      }
    }
    throw new Error('The injected REQUEST is not a UserContext but AsyncContext. Ensure the UserContext is crated and passed to the CQRS execution method call.');
  }
  if (isRequestWithUser(request)) {
    if (isRequestWithUserSub(request)) {
      return request.user.sub;
    }
    throw new Error(
      'The injected REQUEST is a RequestWithUser but the user object does not have the sub property.'
    );
  }
  throw new Error('The injected REQUEST is not a RequestWithUser. Ensure the proper Guard is used.');
}

export function providerUserId(): Provider {
  return {
    provide: USER_ID,
    useFactory: userIdFactory,
    inject: [REQUEST]
  };
}
