import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { TableCreateButtonComponentModule } from './table-create-button.component.module';
import { TableCreateButtonComponent } from './table-create-button.component';

addDecorator(moduleMetadata({
  imports: [
    TableCreateButtonComponentModule
  ]
}));

export default {
  title:     'TableCreateButtonComponent',
  component: TableCreateButtonComponent
};

export const basic = () => ({
  component: TableCreateButtonComponent,
  props:     {}
});
