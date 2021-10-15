import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { ErrorComponentModule } from './error.component.module';
import { ErrorComponent } from './error.component';

addDecorator(moduleMetadata({
  imports: [
    ErrorComponentModule
  ]
}));

export default {
  title:     'ErrorComponent',
  component: ErrorComponent
};

export const basic = () => ({
  component: ErrorComponent,
  props:     {}
});
