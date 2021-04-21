import {
  OAuthService,
  OAuthMethodResponse
} from '@rxap/oauth';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OAuthSingleSignOnService extends OAuthService {

  public payload: string | null  = null;
  public redirect: string | null = null;

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
    remember: boolean
  ): Promise<OAuthMethodResponse> {
    const response = await super.signInWithEmailAndPassword(email, password, remember);
    this.redirectToClient();
    return response;
  }

  public redirectToClient() {
    window.location.replace(`${this.redirect}?accessToken=${this.accessToken}&refreshToken=${this.refreshToken}&expiresIn=${this.expiresIn}&payload=${this.payload}`);
  }

}
