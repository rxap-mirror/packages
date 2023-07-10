import {ModuleWithProviders, NgModule, Provider} from '@angular/core';


import {RXAP_O_AUTH_SSO_REDIRECT_CONTINUE_DISABLED} from './tokens';
import {OAuthSingleSignOnGuard} from './o-auth-single-sign-on.guard';


export interface OAuthSingleSignOnOptions {
  redirectContinueDisabled?: boolean
}

@NgModule({
  exports: [],
  providers: [
    OAuthSingleSignOnGuard,
  ],
})
export class OAuthSingleSignOnRoutingModule {

  public static forRouting(options: OAuthSingleSignOnOptions = {}): ModuleWithProviders<OAuthSingleSignOnRoutingModule> {
    const providers: Provider[] = [
      OAuthSingleSignOnGuard,
    ];
    if (options.redirectContinueDisabled) {
      providers.push({
        provide: RXAP_O_AUTH_SSO_REDIRECT_CONTINUE_DISABLED,
        useValue: options.redirectContinueDisabled,
      });
    }
    return {
      ngModule: OAuthSingleSignOnRoutingModule,
      providers,
    };
  }

}
