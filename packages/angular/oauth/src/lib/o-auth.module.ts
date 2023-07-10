import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  RXAP_O_AUTH_REDIRECT_SIGN_IN,
  RXAP_O_AUTH_REDIRECT_SIGN_OUT,
} from './tokens';

export interface OAuthModuleOptions {
  signInPath?: string[];
  signOutPath?: string[];
}

@NgModule({})
export class OAuthModule {

  public static forRoot(options: OAuthModuleOptions = {}): ModuleWithProviders<OAuthModule> {
    return {
      ngModule: OAuthModule,
      providers: [
        {
          provide: RXAP_O_AUTH_REDIRECT_SIGN_IN,
          useValue: options.signInPath ?? [ '/', 'oauth', 'redirect' ],
        },
        {
          provide: RXAP_O_AUTH_REDIRECT_SIGN_OUT,
          useValue: options.signOutPath ?? null,
        },
      ],
    };
  }

}
