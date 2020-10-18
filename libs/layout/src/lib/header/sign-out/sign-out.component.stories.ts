import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { SignOutComponentModule } from './sign-out.component.module';
import { SignOutComponent } from './sign-out.component';

addDecorator(moduleMetadata({
  imports: [
    SignOutComponentModule,
  ]
}));

export default {
  title:     'SignOutComponent',
  component: SignOutComponent
};

export const basic = () => ({
  component: SignOutComponent,
  props:     {}
});
