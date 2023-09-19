import {
  Injectable,
  isDevMode,
} from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {

  protected readonly permissions$ = new BehaviorSubject<string[]>([]);

  public setPermissions(permissions: string[]): void {
    this.permissions$.next(permissions);
  }

  public checkPermission(
    identifier: string | string[],
    permissions: string[],
    scope?: string | null,
  ): boolean {

    identifier = coerceArray(identifier);

    if (!identifier.length) {
      return true;
    }

    if (isDevMode()) {
      console.log(
        `check permission for [${ identifier.join(', ') }]${ scope ? ` with scope '${ scope }': ` : ' :' }`,
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

    if (identifier.every(id => permissionSubset.includes(id))) {
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

    return identifier.every(id => permissionRegexList.some((permissionRegex) =>
      id.match(permissionRegex),
    ));
  }

  public hasPermission$(
    identifier: string | string[],
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

  public hasPermission(
    identifier: string | string[],
    scope?: string | null,
    ignorePermissionList?: string[],
  ): boolean {
    const allPermissions = this.getPermissions();
    const permissions = ignorePermissionList ?
      allPermissions.filter((permission) => !ignorePermissionList.includes(permission)) :
      allPermissions;

    return this.checkPermission(identifier, permissions, scope);
  }

  public getPermissions$(): Observable<string[]> {
    return this.permissions$.asObservable().pipe(map(permissions => permissions.slice()));
  }

  public getPermissions(): string[] {
    return this.permissions$.value.slice();
  }

}
