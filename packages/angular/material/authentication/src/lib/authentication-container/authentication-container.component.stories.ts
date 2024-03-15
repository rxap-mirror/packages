import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';

import { AuthenticationContainerComponent } from './authentication-container.component';

addDecorator(moduleMetadata({
  imports: [
    BrowserAnimationsModule,
  ],
}));

export default {
  title: 'AuthenticationContainerComponent',
  component: AuthenticationContainerComponent,
};

export const basic = () => (
  {
    component: AuthenticationContainerComponent,
  }
);
