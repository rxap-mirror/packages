import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  Observable,
} from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  Auth,
  AuthProvider,
  authState,
  confirmPasswordReset,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  TwitterAuthProvider,
  User,
} from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';

@Injectable()
export class IdentityPlatformService {
  isAuthenticated$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  public readonly user: Observable<User | null> = EMPTY;

  constructor(
    public readonly auth: Auth,
  ) {
    this.user = authState(this.auth);
    this.isAuthenticated().then(isAuthenticated => this.isAuthenticated$.next(isAuthenticated));
  }

  public async requestPasswordReset(email: string): Promise<boolean> {
    await sendPasswordResetEmail(this.auth, email);
    return true;
  }

  public async sendPasswordReset(password: string, token: string): Promise<boolean> {
    await confirmPasswordReset(this.auth, token, password);
    return true;
  }

  public async signInWithEmailAndPassword(email: string, password: string, remember: boolean): Promise<boolean> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.isAuthenticated$.next(true);
    return true;
  }

  public async signOut(): Promise<boolean> {
    await signOut(this.auth);
    this.isAuthenticated$.next(false);
    return true;
  }

  public google(popup = true): Promise<boolean> {
    return this.withProvider(new GoogleAuthProvider(), popup);
  }

  public github(popup = true): Promise<boolean> {
    return this.withProvider(new GithubAuthProvider(), popup);
  }

  public facebook(popup = true): Promise<boolean> {
    return this.withProvider(new FacebookAuthProvider(), popup);
  }

  public twitter(popup = true): Promise<boolean> {
    return this.withProvider(new TwitterAuthProvider(), popup);
  }

  public isAuthenticated(): Promise<boolean> {
    return firstValueFrom(authState(this.auth).pipe(
      traceUntilFirst('auth'),
      take(1),
      map(Boolean),
    ));
  }

  protected async withProvider(provider: AuthProvider, popup = true) {
    const signIn: Promise<any> = popup ? signInWithPopup(this.auth, provider) : signInWithRedirect(this.auth, provider);
    await signIn;
    this.isAuthenticated$.next(true);
    return true;
  }

}
