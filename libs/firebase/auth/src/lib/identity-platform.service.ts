import { BehaviorSubject } from 'rxjs';
import {
  map,
  take
} from 'rxjs/operators';
import {
  Injectable,
  Inject
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  AuthProvider
} from '@firebase/auth';

@Injectable()
export class IdentityPlatformService {
  isAuthenticated$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  constructor(
    @Inject(AngularFireAuth)
    public fireAuth: AngularFireAuth
  ) {
    this.isAuthenticated().then(isAuthenticated => this.isAuthenticated$.next(isAuthenticated));
  }

  public async requestPasswordReset(email: string): Promise<boolean> {
    await this.fireAuth.sendPasswordResetEmail(email);
    return true;
  }

  public async sendPasswordReset(password: string, token: string): Promise<boolean> {
    await this.fireAuth.confirmPasswordReset(token, password);
    return true;
  }

  public async signInWithEmailAndPassword(email: string, password: string, remember: boolean): Promise<boolean> {
    await this.fireAuth.signInWithEmailAndPassword(email, password);
    this.isAuthenticated$.next(true);
    return true;
  }

  public async signOut(): Promise<boolean> {
    await this.fireAuth.signOut();
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
    const signIn: Promise<any> = popup ? this.fireAuth.signInWithPopup(provider) : this.fireAuth.signInWithRedirect(provider);
    await signIn;
    this.isAuthenticated$.next(true);
    return true;
  }

  public isAuthenticated(): Promise<boolean> {
    return this.fireAuth.authState.pipe(
      take(1),
      map(Boolean)
    ).toPromise();
  }

}
