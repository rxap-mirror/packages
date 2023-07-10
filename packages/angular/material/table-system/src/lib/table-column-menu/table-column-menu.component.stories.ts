import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';
import {TableColumnMenuComponentModule} from './table-column-menu.component.module';
import {TableColumnMenuComponent} from './table-column-menu.component';
import {object} from '@storybook/addon-knobs';

addDecorator(moduleMetadata({
  imports: [
    TableColumnMenuComponentModule,
  ],
}));

export default {
  title: 'TableColumnMenuComponent',
  component: TableColumnMenuComponent,
};

export const basic = () => ({
  component: TableColumnMenuComponent,
  props: {
    columns: object('columns', null),
  },
});
