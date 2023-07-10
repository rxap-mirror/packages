import {
  Inject,
  Injectable,
  isDevMode,
} from '@angular/core';
import {
  BehaviorSubject,
  defer,
  firstValueFrom,
  from,
  Observable,
  of,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { RXAP_GET_SYSTEM_ROLES_METHOD } from './tokens';
import { Method } from '@rxap/pattern';
import { isPromiseLike } from '@rxap/utilities';

type Item = [ string, number, Item[] ];

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
export class AuthorizationService {
  protected readonly permissions$ = new BehaviorSubject<string[]>([]);

  protected readonly systemRoles$: Observable<PermissionMap>;

  constructor(
    @Inject(RXAP_GET_SYSTEM_ROLES_METHOD)
    private readonly getSystemRoles: Method<PermissionMap>,
  ) {
    this.systemRoles$ = defer(
      () => {
        const systemRoles = this.getSystemRoles.call();
        if (isPromiseLike(systemRoles)) {
          return from(systemRoles);
        } else {
          return of(systemRoles);
        }
      },
    ).pipe(shareReplay(1));
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

  public checkPermission(
    identifier: string,
    permissions: string[],
    scope?: string | null,
  ): boolean {
    if (isDevMode()) {
      console.log(
        `check permission for '${ identifier }'${ scope ? ` with scope '${ scope }': ` : ' :' }`,
        permissions,
      );
    }

    // holds all permission, but if a scope is defined only permissions without scope
    // or with the matching scope and the scope prefix is removed
    let permissionSubset = permissions;

    if (scope) {
      permissionSubset = permissions
        .filter(
          (permission) =>
            !permission.match(/\//) ||
            permission.match(new RegExp(`^${ scope.replace('.', '\\.') }/`)),
        ).map((permission) =>
          permission.replace(
            new RegExp(`^${ scope.replace('.', '\\.') }/`),
            '',
          ),
        ).sort((a, b) => a.length - b.length);
    }

    if (permissionSubset.includes(identifier)) {
      return true;
    }

    const permissionRegexList = permissionSubset.map((permission) => {

      const permissionRegex = permission
        .replace('.', '\\.')
        .replace('*', '.+');

      if (permission[0] === '*' && permission[permission.length - 1] === '*') {
        return new RegExp(permissionRegex);
      } else if (permission[0] === '*') {
        return new RegExp(`${ permissionRegex }$`);
      } else if (permission[permission.length - 1] === '*') {
        return new RegExp(`^${ permissionRegex }`);
      } else {
        return new RegExp(`^${ permissionRegex }$`);
      }

    });

    return permissionRegexList.some((permissionRegex) =>
      identifier.match(permissionRegex),
    );
  }

  public hasPermission(
    identifier: string,
    scope?: string | null,
    ignorePermissionList?: string[],
  ): Observable<boolean> {
    return this.permissions$.pipe(
      map((permissions) => ignorePermissionList ?
        permissions.filter((permission) => !ignorePermissionList.includes(permission)) :
        permissions.slice()),
      map((permissions) =>
        this.checkPermission(identifier, permissions, scope),
      ),
      distinctUntilChanged(),
    );
  }

  public getPermissions(): Observable<string[]> {
    return this.permissions$.asObservable().pipe(map(permissions => permissions.slice()));
  }

  public getRoles(): Observable<string[]> {
    return this.systemRoles$.pipe(map(roles => Object.keys(roles)));
  }

}
