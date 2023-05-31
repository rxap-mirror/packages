import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { SignOutComponent } from './sign-out.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'SignOutComponent',
  component: SignOutComponent
};

export const basic = () => ({
  component: SignOutComponent,
  props:     {}
});
