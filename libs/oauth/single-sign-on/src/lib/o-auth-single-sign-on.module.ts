import { NgModule } from '@angular/core';
import { ContinueComponentModule } from './continue/continue.component.module';
import { LoadingComponentModule } from './loading/loading.component.module';

@NgModule({
  exports: [
    ContinueComponentModule,
    LoadingComponentModule
  ]
})
export class OAuthSingleSignOnModule {}
