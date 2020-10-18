import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationContainerComponentModule } from './authentication-container.component.module';
import { AuthenticationContainerComponent } from './authentication-container.component';

addDecorator(moduleMetadata({
  imports: [
    AuthenticationContainerComponentModule,
    BrowserAnimationsModule
  ]
}));

export default {
  title:     'AuthenticationContainerComponent',
  component: AuthenticationContainerComponent
};

export const basic = () => ({
  component: AuthenticationContainerComponent
});
