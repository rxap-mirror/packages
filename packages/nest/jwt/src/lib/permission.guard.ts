import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_METADATA } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {

  @Inject(Logger)
  private readonly logger!: Logger;

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routePermissions = this.reflector.get<string[]>(
      PERMISSIONS_METADATA,
      context.getHandler(),
    );

    if (!routePermissions?.length) {
      this.logger.debug(`Route does not require any permissions`, 'PermissionsGuard');
      return true;
    }
    this.logger.verbose(`Route requires the permissions: %JSON`, routePermissions, 'PermissionGuard');

    const req = context.switchToHttp().getRequest<Request>();

    if (!('user' in req)) {
      this.logger.warn(`The property user is not defined in the request object`, 'PermissionGuard');
      return false;
    }

    if (!req.user || typeof req.user !== 'object') {
      this.logger.warn(`The property user is not an object`, 'PermissionGuard');
      return false;
    }

    let userPermissions: string[] = [];

    if (!('permissions' in req.user)) {
      this.logger.warn(`The property permissions is not defined in the user object`, 'PermissionGuard');
    } else if (!Array.isArray(req.user.permissions)) {
      this.logger.warn(`The property permissions is not an array`, 'PermissionGuard');
    } else {
      userPermissions = req.user.permissions;
    }

    this.logger.verbose('The user has the permissions: %JSON', userPermissions, 'PermissionGuard');

    const canActivate = routePermissions.every(routePermission =>
      userPermissions.includes(routePermission),
    );

    if (!canActivate) {
      this.logger.debug(
        `The user does not have all the required permissions. missing permissions: %JSON`,
        routePermissions.filter(routePermission => !userPermissions.includes(routePermission)),
        'PermissionGuard',
      );
    }

    return canActivate;
  }
}
