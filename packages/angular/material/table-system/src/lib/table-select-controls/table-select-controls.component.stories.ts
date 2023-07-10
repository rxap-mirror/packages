import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import {TableSelectControlsComponentModule} from './table-select-controls.component.module';
import {TableSelectControlsComponent} from './table-select-controls.component';

addDecorator(moduleMetadata({
  imports: [
    TableSelectControlsComponentModule,
  ],
}));

export default {
  title: 'TableSelectControlsComponent',
  component: TableSelectControlsComponent,
};

export const basic = () => ({
  component: TableSelectControlsComponent,
  props: {},
});
