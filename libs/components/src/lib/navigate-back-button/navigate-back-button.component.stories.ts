import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { NavigateBackButtonComponentModule } from './navigate-back-button.component.module';
import { NavigateBackButtonComponent } from './navigate-back-button.component';

addDecorator(moduleMetadata({
  imports: [
    NavigateBackButtonComponentModule
  ]
}));

export default {
  title:     'NavigateBackButtonComponent',
  component: NavigateBackButtonComponent
};

export const basic = () => ({
  component: NavigateBackButtonComponent,
  props:     {}
});
