import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';

import {ExpandControlsCellComponent} from './expand-controls-cell.component';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'ExpandControlsCellComponent',
  component: ExpandControlsCellComponent,
};

export const basic = () => ({
  component: ExpandControlsCellComponent,
  props: {},
});
