import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, defer, from, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take } from 'rxjs/operators';
import { GetSystemRolesRemoteMethod } from './get-system-roles.remote-method';

type Item = [string, number, Item[]];

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly permissions$ = new BehaviorSubject<string[]>([]);

  private readonly systemRoles$: Observable<Record<string, string[]>>;

  constructor(
    @Inject(GetSystemRolesRemoteMethod)
    private readonly getSystemRoles: GetSystemRolesRemoteMethod
  ) {
    this.systemRoles$ = defer(() =>
      from(this.getSystemRoles.call()).pipe(shareReplay(1))
    );
  }

  public async setUserRoles(userRoles: string[]) {
    const systemRoles = await this.systemRoles$.pipe(take(1)).toPromise();

    let permissions: string[] = [];

    for (const userRole of userRoles) {
      if (systemRoles.hasOwnProperty(userRole)) {
        permissions.push(...systemRoles[userRole]);
      }
    }

    permissions = permissions.filter(
      (permission, index, self) => self.indexOf(permission) === index
    );

    this.permissions$.next(permissions);

    return permissions;
  }

  public checkPermission(
    identifier: string,
    permissions: string[],
    scope?: string | null
  ): boolean {
    console.log(
      `check permission for '${identifier}'${
        scope ? ` with scope '${scope}': ` : ' :'
      }`,
      permissions
    );

    // holds all permission, but if a scope is defined only permissions without scope
    // or with the matching scope and the scope prefix is removed
    let permissionSubset = permissions;

    if (scope) {
      permissionSubset = permissions
        .filter(
          (permission) =>
            !permission.match(/\//) ||
            permission.match(new RegExp(`^${scope.replace('.', '\\.')}\/`))
        )
        .map((permission) =>
          permission.replace(new RegExp(`^${scope.replace('.', '\\.')}\/`), '')
        )
        .sort((a, b) => a.length - b.length);
    }

    if (permissionSubset.includes(identifier)) {
      return true;
    }

    const permissionRegexList = permissionSubset.map((permission) => {
      const permissionRegex = permission.replace('.', '\\.').replace('*', '.+');
      if (permission[0] === '*' && permission[permission.length - 1] === '*') {
        return new RegExp(permissionRegex);
      } else if (permission[0] === '*') {
        return new RegExp(`${permissionRegex}$`);
      } else if (permission[permission.length - 1] === '*') {
        return new RegExp(`^${permissionRegex}`);
      } else {
        return new RegExp(`^${permissionRegex}$`);
      }
    });

    return permissionRegexList.some((permissionRegex) =>
      identifier.match(permissionRegex)
    );
  }

  public hasPermission(
    identifier: string,
    scope?: string | null
  ): Observable<boolean> {
    return this.permissions$.pipe(
      map((permissions) =>
        this.checkPermission(identifier, permissions, scope)
      ),
      distinctUntilChanged()
    );
  }
}
