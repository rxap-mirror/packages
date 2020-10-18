import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingComponentModule } from './loading.component.module';
import { LoadingComponent } from './loading.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RxapAuthenticationService } from '@rxap/authentication';
import { of } from 'rxjs';
import { AuthenticationContainerComponentModule } from '../authentication-container/authentication-container.component.module';

addDecorator(moduleMetadata({
  imports:   [
    LoadingComponentModule,
    BrowserAnimationsModule,
    RouterTestingModule,
    AuthenticationContainerComponentModule
  ],
  providers: [
    {
      provide:  RxapAuthenticationService,
      useValue: {
        isAuthenticated$: of(false)
      }
    }
  ]
}));

export default {
  title:     'LoadingComponent',
  component: LoadingComponent
};

export const basic = () => ({
  template: '<rxap-authentication-container><rxap-auth-loading></rxap-auth-loading></rxap-authentication-container>'
});
