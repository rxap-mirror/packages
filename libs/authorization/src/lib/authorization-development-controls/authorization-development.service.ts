import { Injectable } from '@angular/core';
import { AuthorizationService } from '../authorization.service';
import { ToMethod } from '@rxap/utilities/rxjs';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

@Injectable()
export class AuthorizationDevelopmentService extends AuthorizationService {

  public usedPermissions$ = new BehaviorSubject<string[]>([]);

  constructor() {
    super(ToMethod(() => ({})) as any);
    console.warn('use authorization development service');
  }

  public hasPermission(
    identifier: string,
    scope?: string | null
  ): Observable<boolean> {
    const usedPermissions = this.usedPermissions$.value;
    if (!usedPermissions.includes(identifier)) {
      this.usedPermissions$.next([identifier, ...this.usedPermissions$.value]);
    }
    return super.hasPermission(identifier, scope);
  }

  public togglePermission(identifier: string) {
    const permissions = this.permissions$.value;
    if (permissions.includes(identifier)) {
      this.permissions$.next(permissions.filter(permission => permission !== identifier))
    } else {
      this.permissions$.next([ ...permissions, identifier ]);
    }
  }

}
