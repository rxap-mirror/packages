import { NgModule } from '@angular/core';
import {
  ContainerComponentModule
} from './container/container.component.module';
import { LoadingComponentModule } from './loading/loading.component.module';
import { SignInWithRedirectComponentModule } from './sign-in-with-redirect/sign-in-with-redirect.component.module';

@NgModule({
  exports: [
    ContainerComponentModule,
    LoadingComponentModule,
    SignInWithRedirectComponentModule
  ]
})
export class OAuthModule {}
