import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  APP_GUARD,
  Reflector,
} from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { Observable } from 'rxjs';
import { RequestWithJwt } from './types';

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
      throw new BadRequestException('Ensure Authorization header is set');
    }

    const jwtRaw = request.header('Authorization')?.replace('Bearer ', '');

    if (!jwtRaw) {
      throw new BadRequestException('Ensure Authorization header has a value after Bearer');
    }

    try {
      request.jwt = this.jwtService.decode(jwtRaw, { json: true }) as any;
    } catch (e: any) {
      throw new UnauthorizedException(`Ensure Authorization header has a valid JWT`);
    }

    return true;
  }

}

export const JwtGuardProvider = {
  provide: APP_GUARD,
  useClass: JwtGuard,
};
