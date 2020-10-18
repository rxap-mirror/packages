import { NgModule } from '@angular/core';
import { LoginComponentModule } from './login/login.component.module';
import { AuthenticationContainerComponentModule } from './authentication-container/authentication-container.component.module';
import { ResetPasswordComponentModule } from './reset-password/reset-password.component.module';
import { LoadingComponentModule } from './loading/loading.component.module';

@NgModule({
  exports: [
    LoginComponentModule,
    AuthenticationContainerComponentModule,
    ResetPasswordComponentModule,
    LoadingComponentModule
  ]
})
export class RxapAuthenticationModule {}
