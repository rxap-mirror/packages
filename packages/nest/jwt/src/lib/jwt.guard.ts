import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  APP_GUARD,
  Reflector,
} from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { Observable } from 'rxjs';
import {
  IsJwtPayload,
  RequestWithJwt,
} from './types';

@Injectable()
export class JwtGuard implements CanActivate {

  @Inject(Reflector)
  private readonly reflector!: Reflector;

  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  private get authHeaderName(): string {
    return this.config.get<string>('JWT_AUTH_HEADER', 'Authorization');
  }

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

    const headerValue = request.header(this.authHeaderName);

    if (!headerValue) {
      throw new BadRequestException(`Ensure '${this.authHeaderName}' header is set`);
    }

    let token: string = headerValue;

    if (headerValue.startsWith('Bearer ')) {
      token = headerValue.replace('Bearer ', '');
    }

    const jwt = this.verify(token);

    if (!IsJwtPayload(jwt)) {
      throw new BadRequestException('JWT token is missing sub claim');
    }

    request.jwt = jwt;

    return true;
  }

  protected verify(token: string): Record<string, any> {

    if (this.config.get<boolean>('JWT_VERIFY')) {
      try {
        return this.jwtService.verify(token);
      } catch (e: any) {
        throw new UnauthorizedException(`Ensure '${this.authHeaderName}' header has a valid JWT`);
      }
    }
    let jwt: string | Record<string, any> | null;
    try {
      jwt = this.jwtService.decode(token, { json: true });
    } catch (e: any) {
      throw new BadRequestException(`Failed to decode the jwt token in the header '${this.authHeaderName}'`);
    }

    if (jwt === null) {
      throw new BadRequestException('JWT is decoded as null');
    }

    if (typeof jwt === 'string') {
      throw new BadRequestException('JWT token is decoded as a string');
    }

    return jwt;

  }

}

export const JwtGuardProvider = {
  provide: APP_GUARD,
  useClass: JwtGuard,
};
