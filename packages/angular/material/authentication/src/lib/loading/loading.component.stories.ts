import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { of } from 'rxjs';

import { LoadingComponent } from './loading.component';


addDecorator(moduleMetadata({
  imports: [
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
  providers: [
    {
      provide: RxapAuthenticationService,
      useValue: {
        isAuthenticated$: of(false),
      },
    },
  ],
}));

export default {
  title: 'LoadingComponent',
  component: LoadingComponent,
};

export const basic = () => (
  {
    template: '<rxap-authentication-container><rxap-auth-loading></rxap-auth-loading></rxap-authentication-container>',
  }
);
