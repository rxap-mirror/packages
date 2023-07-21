import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  APP_GUARD,
  Reflector,
} from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RequestWithJwt } from './types';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';

@Injectable()
export class JwtGuard implements CanActivate {

  @Inject(Reflector)
  private readonly reflector!: Reflector;

  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithJwt>();

    if (!request.header('Authorization')?.match(/^Bearer /)) {
      return false;
    }

    const jwtRaw = request.header('Authorization')?.replace('Bearer ', '');

    if (!jwtRaw) {
      return false;
    }

    request.jwt = this.jwtService.decode(jwtRaw, { json: true }) as any;

    return true;
  }

}

export const JwtGuardProvider = {
  provide: APP_GUARD,
  useClass: JwtGuard,
};
