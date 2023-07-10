import {
  Inject,
  Injectable,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import {
  BehaviorSubject,
  Observable,
  switchMap,
} from 'rxjs';
import {
  AuthorizationService,
  PermissionMap,
} from './authorization.service';
import { RXAP_GET_SYSTEM_ROLES_METHOD } from './tokens';
import {
  map,
  take,
  tap,
} from 'rxjs/operators';

@Injectable()
export class AuthorizationDevelopmentService extends AuthorizationService {

  public disabledPermissions$ = new BehaviorSubject<string[]>([]);

  constructor(
    @Inject(RXAP_GET_SYSTEM_ROLES_METHOD)
      getSystemRoles: Method<PermissionMap>,
  ) {
    super(getSystemRoles);
    console.warn('use authorization development service');
    this.getRoles().pipe(
      take(1),
      tap(roles => this.setUserRoles(roles)),
    ).subscribe();
  }

  public override hasPermission(
    identifier: string,
    scope?: string | null,
    ignorePermissionList?: string[],
  ): Observable<boolean> {
    return this.disabledPermissions$.pipe(
      map(disabledPermissions => [
        ...disabledPermissions, ...(
          ignorePermissionList ?? []
        ),
      ]),
      switchMap(ignorePermissionList => super.hasPermission(identifier, scope, ignorePermissionList)),
    );
  }

  public togglePermission(identifier: string) {
    const disabledPermissions = this.disabledPermissions$.value.slice();
    if (disabledPermissions.includes(identifier)) {
      disabledPermissions.splice(disabledPermissions.indexOf(identifier), 1);
    } else {
      disabledPermissions.push(identifier);
    }
    this.disabledPermissions$.next(disabledPermissions);
  }

}
