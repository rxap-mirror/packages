import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { CheckboxCellComponent } from './checkbox-cell.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'CheckboxCellComponent',
  component: CheckboxCellComponent
};

export const basic = () => ({
  component: CheckboxCellComponent,
  props:     {}
});
