import { NgModule } from '@angular/core';
import { ContinueComponentModule } from './continue/continue.component.module';
import { LoadingComponentModule } from './loading/loading.component.module';
import { ContainerComponentModule } from './container/container.component.module';

@NgModule({
  exports: [
    ContinueComponentModule,
    LoadingComponentModule,
    ContainerComponentModule
  ]
})
export class OAuthSingleSignOnModule {}
