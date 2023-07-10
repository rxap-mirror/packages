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
import {
  ALLOW_UNVERIFIED_EMAIL,
  DEACTIVATE_FIREBASE_AUTH_GUARD,
  FIREBASE_AUTH_HEADER,
} from './tokens';
import * as admin from 'firebase-admin';
import { FirebaseUser } from './types';


export interface RequestWithDecodedIdToken extends Request {
  user: FirebaseUser;
}

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

  public async canActivate(context: ExecutionContext): Promise<boolean> {

    this.logger.verbose('canActivate', 'FirebaseAuthGuard');

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

  public validateIdToken(idToken: string): Promise<FirebaseUser | null> {
    return admin
      .auth()
      .verifyIdToken(idToken, true)
      .then((res) => {
        if (res.firebase?.sign_in_provider === 'anonymous') {
          // TODO : add options to disallow anonymous users
          this.logger.debug('The idToken is valid and the user is anonymous', 'FirebaseAuthGuard');
          return res;
        } else {
          this.logger.debug('The idToken is valid', 'FirebaseAuthGuard');
          this.logger.verbose(
            'check if email is verified. AllowUnverifiedEmail: ' + this.allowUnverifiedEmail,
            'FirebaseAuthGuard',
          );
          if (this.allowUnverifiedEmail || !!res.email_verified) {
            return res;
          }
          this.logger.debug('Email is not verified', 'FirebaseAuthGuard');
        }
        return null;
      })
      .catch((err) => {
        this.logger.debug(`The idToken is not valid: ${ err.message }`, 'FirebaseAuthGuard');
        return null;
      });
  }

}
