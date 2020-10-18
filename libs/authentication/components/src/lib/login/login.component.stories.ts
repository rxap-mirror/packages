import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponentModule } from './login.component.module';
import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RxapAuthenticationService } from '@rxap/authentication';
import { AuthenticationContainerComponentModule } from '../authentication-container/authentication-container.component.module';

addDecorator(moduleMetadata({
  imports:   [
    LoginComponentModule,
    AuthenticationContainerComponentModule,
    BrowserAnimationsModule,
    RouterTestingModule
  ],
  providers: [
    {
      provide:  RxapAuthenticationService,
      useValue: {
        signInWithEmailAndPassword: (password: string) => new Promise(resolve => {

          setTimeout(() => {
            resolve(password === '1235');
          }, 2000);

        }),
        requestPasswordReset:       (email: string) => new Promise(resolve => {

          setTimeout(() => {
            resolve(email !== 'fail@fail');
          }, 2000);

        })
      }
    }
  ]
}));

export default {
  title:     'LoginComponent',
  component: LoginComponent
};

export const basic = () => ({
  template: '<rxap-authentication-container><rxap-login></rxap-login></rxap-authentication-container>'
});
