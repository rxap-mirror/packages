import {moduleMetadata, Story} from '@storybook/angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {LoginComponent} from './login.component';
import {RouterTestingModule} from '@angular/router/testing';
import {RxapAuthenticationService} from '@rxap/authentication';


export default {
  title: 'LoginComponent',
  component: LoginComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: RxapAuthenticationService,
          useValue: {
            signInWithEmailAndPassword: (password: string) => new Promise(resolve => {

              setTimeout(() => {
                resolve(password === '1235');
              }, 2000);

            }),
            requestPasswordReset: (email: string) => new Promise(resolve => {

              setTimeout(() => {
                resolve(email !== 'fail@fail');
              }, 2000);

            }),
          },
        },
      ],
    }),
  ],
};

const Template: Story = () => ({
  template: '<rxap-authentication-container><rxap-login></rxap-login></rxap-authentication-container>',
});

export const Default = Template.bind({});
