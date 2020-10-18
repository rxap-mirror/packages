import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { RxapAuthenticationService } from '@rxap/authentication';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordComponentModule } from './reset-password.component.module';
import { AuthenticationContainerComponentModule } from '../authentication-container/authentication-container.component.module';

addDecorator(moduleMetadata({
  imports:   [
    ResetPasswordComponentModule,
    BrowserAnimationsModule,
    AuthenticationContainerComponentModule,
    RouterTestingModule
  ],
  providers: [
    {
      provide:  RxapAuthenticationService,
      useValue: {
        sendPasswordReset: (email: string) => new Promise(resolve => {

          setTimeout(() => {
            resolve(email !== 'fail');
          }, 2000);

        })
      }
    }
  ]
}));

export default {
  title:     'ResetPasswordComponent',
  component: ResetPasswordComponent
};

export const basic = () => ({
  template: '<rxap-authentication-container><rxap-reset-password></rxap-reset-password></rxap-authentication-container>'
});
