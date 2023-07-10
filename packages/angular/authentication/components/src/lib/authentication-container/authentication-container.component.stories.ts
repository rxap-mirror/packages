import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AuthenticationContainerComponent} from './authentication-container.component';

addDecorator(moduleMetadata({
  imports: [
    BrowserAnimationsModule,
  ],
}));

export default {
  title: 'AuthenticationContainerComponent',
  component: AuthenticationContainerComponent,
};

export const basic = () => ({
  component: AuthenticationContainerComponent,
});
