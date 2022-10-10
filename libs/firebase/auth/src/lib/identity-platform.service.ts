import {
  BehaviorSubject,
  Observable,
  EMPTY
} from 'rxjs';
import {
  map,
  take
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  AuthProvider
} from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';

@Injectable()
export class IdentityPlatformService {
  isAuthenticated$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  public readonly user: Observable<User | null> = EMPTY;

  constructor(
    public readonly auth: Auth
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

  public google(popup: boolean = true): Promise<boolean> {
    return this.withProvider(new GoogleAuthProvider(), popup);
  }

  public github(popup: boolean = true): Promise<boolean> {
    return this.withProvider(new GithubAuthProvider(), popup);
  }

  public facebook(popup: boolean = true): Promise<boolean> {
    return this.withProvider(new FacebookAuthProvider(), popup);
  }

  public twitter(popup: boolean = true): Promise<boolean> {
    return this.withProvider(new TwitterAuthProvider(), popup);
  }

  protected async withProvider(provider: AuthProvider, popup: boolean = true) {
    const signIn: Promise<any> = popup ? signInWithPopup(this.auth, provider) : signInWithRedirect(this.auth, provider);
    await signIn;
    this.isAuthenticated$.next(true);
    return true;
  }

  public isAuthenticated(): Promise<boolean> {
    return authState(this.auth).pipe(
      traceUntilFirst('auth'),
      take(1),
      map(Boolean)
    ).toPromise();
  }

}
