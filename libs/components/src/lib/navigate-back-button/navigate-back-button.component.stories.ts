import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { NavigateBackButtonComponent } from './navigate-back-button.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'NavigateBackButtonComponent',
  component: NavigateBackButtonComponent
};

export const basic = () => ({
  component: NavigateBackButtonComponent,
  props:     {}
});
