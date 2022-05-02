import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  ReplaySubject
} from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RXAP_AUTHENTICATION_DEACTIVATED } from './tokens';

export const RXAP_AUTHENTICATION_LOCAL_STORAGE_KEY = 'rxap__authenticated';

export interface IAuthenticationService {
  isAuthenticated$: Observable<boolean | null>;

  requestPasswordReset(email: string): Promise<boolean>;

  sendPasswordReset(password: string, token: string): Promise<boolean>;

  signInWithEmailAndPassword(email: string, password: string, remember: boolean): Promise<boolean>;

  signOut(): Promise<void>;

}

export function TimeoutPromise<T>(callback: (resolve: (value: T) => void, reject: (error: any) => void) => void, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {

    setTimeout(() => {
      callback(resolve, reject);
    }, ms);

  });
}

export function TimeoutResolve<T>(value: T, ms: number): Promise<T> {
  return new Promise(resolve => {

    setTimeout(() => {
      resolve(value);
    }, ms);

  });
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
/* ignore coverage */
export class RxapAuthenticationService implements IAuthenticationService {

  public isAuthenticated$ = new BehaviorSubject<boolean | null>(null);

  public readonly events$ = new ReplaySubject<AuthenticationEvent>();

  constructor() {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    this.isAuthenticated().then(isAuthenticated => this.isAuthenticated$.next(isAuthenticated));
  }

  public requestPasswordReset(email: string): Promise<boolean> {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    return TimeoutResolve(email !== 'fail@fail', 2500);
  }

  public sendPasswordReset(password: string, token: string): Promise<boolean> {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    return TimeoutResolve(password !== 'fail', 2500);
  }

  public async signInWithEmailAndPassword(email: string, password: string, remember: boolean): Promise<boolean> {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    return TimeoutPromise((resolve, reject) => {

      const login = password !== 'fail';
      this.isAuthenticated$.next(login);
      if (login) {
        if (remember) {
          localStorage.setItem(RXAP_AUTHENTICATION_LOCAL_STORAGE_KEY, 'true');
        }
        resolve(login);
        this.events$.next({ type: AuthenticationEventType.OnAuthSuccess });
      } else {
        localStorage.removeItem(RXAP_AUTHENTICATION_LOCAL_STORAGE_KEY);
        reject(new Error('Login credentials are invalid'));
        this.events$.next({ type: AuthenticationEventType.OnAuthError });
      }

    }, 2500);

  }

  public async signOut(): Promise<void> {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    this.isAuthenticated$.next(false);
    localStorage.removeItem(RXAP_AUTHENTICATION_LOCAL_STORAGE_KEY);
    this.events$.next({ type: AuthenticationEventType.OnLogout });
  }

  public signInWithProvider(provider: string): Promise<boolean> {
    console.warn('The default RxapAuthenticationService implementation should only be used in a development environment!');
    return Promise.resolve(false);
  }

  public isAuthenticated(): Promise<boolean> {
    return TimeoutPromise((resolve) => {
      resolve(localStorage.getItem(RXAP_AUTHENTICATION_LOCAL_STORAGE_KEY) === 'true');
    }, 2500);
  }

}
