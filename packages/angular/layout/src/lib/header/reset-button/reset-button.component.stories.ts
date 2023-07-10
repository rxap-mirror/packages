import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';

import {ResetButtonComponent} from './reset-button.component';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'ResetButtonComponent',
  component: ResetButtonComponent,
};

export const basic = () => ({
  component: ResetButtonComponent,
  props: {},
});
