import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { TableSelectWindowComponent } from './table-select-window.component';
import { TableSelectWindowComponentModule } from './table-select-window.component.module';

addDecorator(moduleMetadata({
  imports: [
    TableSelectWindowComponentModule,
  ],
}));

export default {
  title: 'TableSelectWindowComponent',
  component: TableSelectWindowComponent,
};

export const basic = () => ({
  component: TableSelectWindowComponent,
  props: {},
});
