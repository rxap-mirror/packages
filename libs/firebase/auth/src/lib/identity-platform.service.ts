import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  map,
  take
} from 'rxjs/operators';
import {
  Injectable,
  Inject
} from '@angular/core';
import firebase from 'firebase';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

@Injectable()
export class IdentityPlatformService {
  isAuthenticated$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  constructor(
    @Inject(AngularFireAuth)
    public fireAuth: AngularFireAuth
  ) {
    this.isAuthenticated().then(isAuthenticated => this.isAuthenticated$.next(isAuthenticated));
  }

  public requestPasswordReset(email: string): Promise<boolean> {
    return this.fireAuth.sendPasswordResetEmail(email).then(() => true).catch(() => false);
  }

  public sendPasswordReset(password: string, token: string): Promise<boolean> {
    return this.fireAuth.confirmPasswordReset(token, password).then(() => true).catch(() => false);
  }

  public signInWithEmailAndPassword(email: string, password: string, remember: boolean): Promise<boolean> {
    return this.fireAuth.signInWithEmailAndPassword(email, password).then(() => true).catch(() => false).then(status => {
      this.isAuthenticated$.next(status);
      return status;
    });
  }

  public signOut(): Promise<boolean> {
    return this.fireAuth.signOut().then(() => true).catch(() => false).then(status => {
      this.isAuthenticated$.next(!status);
      return status;
    });
  }

  public google(popup: boolean = true): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    const signIn: Promise<any> = popup ? this.fireAuth.signInWithPopup(provider) : this.fireAuth.signInWithRedirect(provider);
    return signIn.then(() => true).catch(() => false).then(status => {
      this.isAuthenticated$.next(status);
      return status;
    });
  }

  public isAuthenticated(): Promise<boolean> {
    return this.fireAuth.authState.pipe(
      take(1),
      map(Boolean)
    ).toPromise();
  }

}
