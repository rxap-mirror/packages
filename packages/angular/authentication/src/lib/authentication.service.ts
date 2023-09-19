import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
} from 'rxjs';

export interface IAuthenticationService {
  isAuthenticated$: Observable<boolean | null>;
  events$: Observable<AuthenticationEvent>;
  signOut(): Promise<void>;

  isAuthenticated(): Promise<boolean>;
}

export enum AuthenticationEventType {
  OnAuthSuccess = 'on-auth-success',
  OnAuthError = 'on-auth-error',
  OnLogout = 'on-logout',
}

export interface AuthenticationEvent extends Record<string, any> {
  type: AuthenticationEventType;
}

@Injectable({ providedIn: 'root' })
export class RxapAuthenticationService implements IAuthenticationService {

  public isAuthenticated$ = new BehaviorSubject<boolean | null>(null);

  public readonly events$ = new ReplaySubject<AuthenticationEvent>();

  private _authenticated = true;

  constructor() {
    this.isAuthenticated().then(isAuthenticated => this.isAuthenticated$.next(isAuthenticated));
  }

  public async signOut(): Promise<void> {
    this._authenticated = false;
    this.isAuthenticated$.next(this._authenticated);
    this.events$.next({ type: AuthenticationEventType.OnLogout });
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.resolve(this._authenticated);
  }

}
