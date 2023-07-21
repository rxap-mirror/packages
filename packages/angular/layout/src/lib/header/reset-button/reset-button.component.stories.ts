import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { ResetButtonComponentModule } from './reset-button.component.module';
import { ResetButtonComponent } from './reset-button.component';

addDecorator(moduleMetadata({
  imports: [
    ResetButtonComponentModule,
  ],
}));

export default {
  title: 'ResetButtonComponent',
  component: ResetButtonComponent,
};

export const basic = () => ({
  component: ResetButtonComponent,
  props: {},
});
