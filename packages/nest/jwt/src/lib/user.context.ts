import { AsyncContext } from '@nestjs/cqrs';
import {
  isRequestWithUser,
  isRequestWithUserSub,
} from '@rxap/nest-jwt';
import { Request } from 'express';

export class UserContext extends AsyncContext {
  static fromRequest(request: Request) {
    if (isRequestWithUser(request)) {
      if (isRequestWithUserSub(request)) {
        return new UserContext(request.user.sub);
      }
      throw new Error('The user object does not contain a sub property');
    }
    throw new Error('The request does not contain a user object.');
  }

  constructor(readonly userId: string) {
    super();
  }
}
