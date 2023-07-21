import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  DefaultUser,
  RequestWithJwtAndUser,
} from './types';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { Command } from '@rxap/pattern';

export const GET_USER_COMMAND = Symbol('GET_USER_COMMAND');

@Injectable()
export class UserGuard<User = DefaultUser> implements CanActivate {

  @Inject(Reflector)
  private readonly reflector!: Reflector;

  @Inject(GET_USER_COMMAND)
  private readonly getUserCommand!: Command<User, void>;

  private _userCache = new Map<string, User>();

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithJwtAndUser<User>>();

    if (!this._userCache.has(request.jwt.sub)) {
      this._userCache.set(request.jwt.sub, await this.getUserCommand.execute());
    }

    request.user = this._userCache.get(request.jwt.sub)!;

    return true;
  }
}
