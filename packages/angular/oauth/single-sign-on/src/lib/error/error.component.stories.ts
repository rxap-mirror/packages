import {addDecorator, moduleMetadata} from '@storybook/angular';

import {ErrorComponent} from './error.component';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'ErrorComponent',
  component: ErrorComponent,
};

export const basic = () => ({
  component: ErrorComponent,
  props: {},
});
