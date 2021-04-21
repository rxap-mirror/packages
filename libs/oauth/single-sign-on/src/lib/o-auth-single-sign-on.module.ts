import { NgModule } from '@angular/core';
import {
  ContainerComponentModule,
  LoadingComponentModule
} from '@rxap/oauth';
import { ContinueComponentModule } from './continue/continue.component.module';

@NgModule({
  exports: [
    ContinueComponentModule,
    LoadingComponentModule,
    ContainerComponentModule
  ]
})
export class OAuthSingleSignOnModule {}
