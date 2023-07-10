import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';

import { ExpandRowContainerComponent } from './expand-row-container.component';
import {
  boolean,
  object,
} from '@storybook/addon-knobs';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'ExpandCellComponent',
  component: ExpandRowContainerComponent,
};

export const basic = () => ({
  component: ExpandRowContainerComponent,
  props: {
    element: object('element', null),
    expanded: boolean('expanded', false),
  },
});
