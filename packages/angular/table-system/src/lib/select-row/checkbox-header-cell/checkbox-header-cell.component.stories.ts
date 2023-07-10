import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';

import { CheckboxHeaderCellComponent } from './checkbox-header-cell.component';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'CheckboxHeaderCellComponent',
  component: CheckboxHeaderCellComponent,
};

export const basic = () => ({
  component: CheckboxHeaderCellComponent,
  props: {},
});
