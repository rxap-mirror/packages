import {
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  @Inject(Logger)
  private readonly logger!: Logger;

  constructor(config: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.get('AUTH0_ISSUER_URL')}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get('AUTH0_AUDIENCE'),
      issuer: `${config.get('AUTH0_ISSUER_URL')}`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: unknown): unknown {
    this.logger.verbose('validate: %JSON', payload, 'JwtStrategy');
    return payload;
  }
}
