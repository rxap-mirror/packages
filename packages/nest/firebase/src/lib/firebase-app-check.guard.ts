import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import {RequestWithDecodedIdToken} from './firebase-auth.guard';
import * as admin from 'firebase-admin';
import {DEACTIVATE_APP_CHECK_GUARD} from './tokens';

@Injectable()
export class FirebaseAppCheckGuard implements CanActivate {

  @Inject(Logger)
  private readonly logger!: Logger;

  @Optional()
  @Inject(DEACTIVATE_APP_CHECK_GUARD)
  private readonly deactivated: boolean = false

  public async canActivate(context: ExecutionContext): Promise<boolean> {

    if (this.deactivated) {
      this.logger.debug('deactivated', 'FirebaseAppCheckGuard');
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithDecodedIdToken>();

    const appCheckToken = request.headers.get('X-Firebase-AppCheck');

    if (!appCheckToken) {
      throw new BadRequestException(`The app check header is missing. Ensure that the client has firebase app check enabled and sends the header.`);
    }

    try {
      await admin.appCheck().verifyToken(appCheckToken);
    } catch (e) {
      throw new ForbiddenException('The app check claim is not valid');
    }

    return true;

  }

}
