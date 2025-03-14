import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class Auth0Guard implements CanActivate {

  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(Reflector)
  protected readonly reflector!: Reflector;

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!jwt) {
      this.logger.debug('No Bearer token found in authorization header', 'Auth0Guard')
      return false;
    }

    const payload = await this.jwtService.verifyAsync(jwt);

    if (!payload) {
      this.logger.warn('JWT verification failed', 'Auth0Guard')
      return false;
    }

    this.logger.verbose(`JWT verification succeeded for user ${payload.sub}`, 'Auth0Guard');
    request.user = payload;

    return true;

  }

}
