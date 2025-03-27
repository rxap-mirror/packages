import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { ExtractJwt } from 'passport-jwt';
import { Auth0Options } from './auth0-options';
import { AUTH0_OPTIONS } from './tokens';
import { Request } from 'express';

@Injectable()
export class Auth0Guard implements CanActivate {

  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(Reflector)
  protected readonly reflector!: Reflector;

  @Inject(AUTH0_OPTIONS)
  private readonly options!: Auth0Options;

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

    const request = context.switchToHttp().getRequest<Request>();

    if (this.options.disabled) {
      this.logger.warn('Auth0 is disabled', 'Auth0Guard');
      const user: any = request.user = {};
      if (request.headers['x-user-id']) {
        user.sub = request.headers['x-user-id'];
      }
      if (request.headers['x-user-sub']) {
        user.sub = request.headers['x-user-sub'];
      }
      user.aud = request.headers['x-user-aud'];
      user.roles = request.headers['x-user-roles'];
      user.displayName = request.headers['x-user-display-name'];
      user.email = request.headers['x-user-email'];
      user.usernane = request.headers['x-user-username'];
      user.name = request.headers['x-user-name'];
      user.nickname = request.headers['x-user-nickname'];
      if (request.user && 'sub' in request.user) {
        return true;
      } else {
        this.logger.warn(
          'Request is not authenticated. Please check the authorization header. Ensure the header x-user-id or x-user-sub is set. Fallback to bearer token authentication.',
          'Auth0Guard'
        );
      }
    }

    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!jwt) {
      this.logger.debug('No Bearer token found in authorization header', 'Auth0Guard');
      return false;
    }

    const payload = await this.jwtService.verifyAsync(jwt);

    if (!payload) {
      this.logger.warn('JWT verification failed', 'Auth0Guard');
      return false;
    }

    this.logger.verbose(`JWT verification succeeded for user ${payload.sub}`, 'Auth0Guard');
    request.user = payload;

    return true;

  }

}
