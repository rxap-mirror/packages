import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import {
  ContainerComponentModule
} from './container/container.component.module';
import { LoadingComponentModule } from './loading/loading.component.module';
import { SignInWithRedirectComponentModule } from './sign-in-with-redirect/sign-in-with-redirect.component.module';
import { RXAP_O_AUTH_REDIRECT_LOGIN } from './tokens';

export interface OAuthModuleOptions {
  loginPath?: string[]
}

@NgModule({
  exports: [
    ContainerComponentModule,
    LoadingComponentModule,
    SignInWithRedirectComponentModule
  ]
})
export class OAuthModule {

  public static forRoot(options: OAuthModuleOptions = {}): ModuleWithProviders<OAuthModule> {
    return {
      ngModule:  OAuthModule,
      providers: [
        {
          provide:  RXAP_O_AUTH_REDIRECT_LOGIN,
          useValue: options.loginPath ?? [ '/', 'oauth', 'redirect' ]
        }
      ]
    };
  }

}
