import {
  Inject,
  Injectable,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import { isPromiseLike } from '@rxap/utilities';
import {
  BehaviorSubject,
  defer,
  firstValueFrom,
  from,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  map,
  shareReplay,
  take,
  tap,
} from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_GET_SYSTEM_ROLES_METHOD } from './tokens';

/**
 * A map of roles and permissions
 * @example
 * {
 *  'admin': ['permission1', 'permission2'],
 *  'user': ['permission1']
 *  'guest': []
 * }
 */
export type PermissionMap = Record<string, string[]>;

@Injectable()
export class AuthorizationDevelopmentService extends AuthorizationService {

  public disabledPermissions$ = new BehaviorSubject<string[]>([]);

  protected readonly systemRoles$: Observable<PermissionMap>;

  constructor(
    @Inject(RXAP_GET_SYSTEM_ROLES_METHOD)
      getSystemRoles: Method<PermissionMap>,
  ) {
    super();
    this.systemRoles$ = defer(
      () => {
        const systemRoles = getSystemRoles.call();
        if (isPromiseLike(systemRoles)) {
          return from(systemRoles);
        } else {
          return of(systemRoles);
        }
      },
    ).pipe(shareReplay(1));
    console.warn('use authorization development service');
    this.getRoles().pipe(
      take(1),
      tap(roles => this.setUserRoles(roles)),
    ).subscribe();
  }

  public getRoles(): Observable<string[]> {
    return this.systemRoles$.pipe(map(roles => Object.keys(roles)));
  }

  public async setUserRoles(userRoles: string[]) {
    const systemRoles = await firstValueFrom(this.systemRoles$);

    let permissions: string[] = [];

    for (const userRole of userRoles) {
      if (systemRoles && systemRoles[userRole]) {
        permissions.push(...systemRoles[userRole]);
      }
    }

    permissions = permissions.filter(
      (permission, index, self) => self.indexOf(permission) === index,
    );

    this.permissions$.next(permissions);

    return permissions;
  }

  public override hasPermission$(
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
      switchMap(ignorePermissionList => super.hasPermission$(identifier, scope, ignorePermissionList)),
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
