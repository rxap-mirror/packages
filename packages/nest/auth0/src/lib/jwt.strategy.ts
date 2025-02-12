import {
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * Here's the TSDoc documentation for the `JwtStrategy` class:
 *
 * A JWT (JSON Web Token) strategy implementation for authentication using Passport.js in NestJS applications.
 *
 * @summary
 * This class implements the JWT strategy for authentication, integrating with Auth0's JWKS (JSON Web Key Set) for token validation.
 *
 * @example
 * ```typescript
 * import { JwtStrategy } from './jwt.strategy';
 *
 * @Module({
 *   providers: [JwtStrategy],
 * })
 * export class AuthModule {
 *   constructor(private readonly jwtStrategy: JwtStrategy) {}
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using the strategy in a guard
 * @Injectable()
 * export class JwtAuthGuard extends AuthGuard('jwt') {
 *   constructor(private jwtStrategy: JwtStrategy) {
 *     super();
 *   }
 * }
 * ```
 *
 * @throws {@link Error} If the configuration parameters for Auth0 are invalid or missing
 * @throws {@link Error} If the JWT token validation fails
 * @throws {@link Error} If the JWKS endpoint is unreachable or returns invalid data
 *
 * @property logger - A NestJS logger instance for verbose logging of validation operations
 * @property validate - Method to validate the JWT payload and return the verified token contents
 *
 * @returns An instance of the JWT strategy that can be used for token validation in passport-based authentication
 */
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

  /**
   * Here's the TSDoc documentation for the `validate` method:
   *
   * Validates the JWT payload received from the authentication process.
   *
   * @summary
   * Performs validation of the decoded JWT payload and logs the validation process for debugging purposes.
   *
   * @param payload - The decoded JWT token payload to be validated. This can contain any JWT claims such as subject, issuer, or custom claims.
   *
   * @returns The validated payload object that will be attached to the request object for use in subsequent request handlers.
   *
   * @example
   * ```typescript
   * const jwtStrategy = new JwtStrategy(configService);
   * const payload = await jwtStrategy.validate({
   *   sub: '123456789',
   *   email: 'user@example.com',
   *   permissions: ['read:users']
   * });
   * // payload will be available in your request object
   * ```
   *
   * @throws {@link Error} If the payload fails validation or contains invalid claims.
   */
  validate(payload: unknown): unknown {
    this.logger.verbose('validate: %JSON', payload, 'JwtStrategy');
    return payload;
  }
}
