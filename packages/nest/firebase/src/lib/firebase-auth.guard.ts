import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  ALLOW_UNVERIFIED_EMAIL,
  DEACTIVATE_FIREBASE_AUTH_GUARD,
  FIREBASE_AUTH_HEADER,
} from './tokens';
import { FirebaseUser } from './types';


/**
 * Represents a request with a decoded ID token.
 *
 * @interface RequestWithDecodedIdToken
 * @extends Request
 */
export interface RequestWithDecodedIdToken extends Request {
  user: FirebaseUser;
}

/**
 * Injectable class implementing CanActivate interface.
 *
 * This class is responsible for checking if the user is authorized to access a specific route.
 *
 * @constructor
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {

  @Inject(Logger)
  private readonly logger!: Logger;

  @Optional()
  @Inject(ALLOW_UNVERIFIED_EMAIL)
  private readonly allowUnverifiedEmail: boolean = false;

  @Optional()
  @Inject(FIREBASE_AUTH_HEADER)
  private readonly authHeaderName: string = 'idtoken';

  @Optional()
  @Inject(DEACTIVATE_FIREBASE_AUTH_GUARD)
  private readonly deactivated: boolean = false;

  /**
   * Checks if the user is authorized to access a specific route.
   *
   * @async
   * @param {ExecutionContext} context - The execution context containing the current request.
   * @returns {Promise<boolean>} - Returns a Promise that resolves to a boolean indicating whether the user is authorized.
   * @throws {BadRequestException} - Throws a BadRequestException if the idToken header is missing or provided multiple times.
   * @throws {InternalServerErrorException} - Throws an InternalServerErrorException if the idToken validation fails without an expected error.
   * @throws {UnauthorizedException} - Throws an UnauthorizedException if the idToken is not valid.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {

    if (this.deactivated) {
      this.logger.debug('deactivated', 'FirebaseAuthGuard');
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithDecodedIdToken>();

    const idToken = (request.headers as any as Record<string, string | string[]>)[this.authHeaderName?.toLowerCase()];

    if (!idToken) {
      throw new BadRequestException(`The idToken header is missing. Expected a header with the name '${ this.authHeaderName }'`);
    }

    if (Array.isArray(idToken)) {
      throw new BadRequestException(`The idToken header '${ this.authHeaderName }' is provided multiple times. Ensure that the header is only send once with the request.`);
    }

    let decodedIdToken: FirebaseUser | null = null;
    try {
      decodedIdToken = await this.validateIdToken(idToken);
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Could not validate the idToken. The validation request failed without an expected error.',
        e.message,
      );
    }

    if (!decodedIdToken) {
      throw new UnauthorizedException('The idToken is not valid.');
    }

    request.user = decodedIdToken;

    return true;

  }

  /**
   * Validates the given ID token using Firebase Authentication.
   *
   * @param {string} idToken - The ID token to be validated.
   *
   * @return {Promise<FirebaseUser | null>} A promise that resolves to a FirebaseUser object if the ID token is valid,
   * or null if the ID token is not valid.
   */
  public validateIdToken(idToken: string): Promise<FirebaseUser | null> {
    return admin
      .auth()
      .verifyIdToken(idToken, true)
      .then((res) => {
        if (res.firebase?.sign_in_provider === 'anonymous') {
          // TODO : add options to disallow anonymous users
          this.logger.verbose('The idToken is valid and the user is anonymous', 'FirebaseAuthGuard');
          return res;
        } else {
          if (this.allowUnverifiedEmail || !!res.email_verified) {
            return res;
          }
          this.logger.verbose('Email is not verified', 'FirebaseAuthGuard');
        }
        return null;
      })
      .catch((err) => {
        this.logger.verbose(`The idToken is not valid: ${ err.message }`, 'FirebaseAuthGuard');
        return null;
      });
  }

}
