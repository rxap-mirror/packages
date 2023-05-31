import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { DarkModeToggleButtonComponent } from './dark-mode-toggle-button.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'DarkModeToggleButtonComponent',
  component: DarkModeToggleButtonComponent
};

export const basic = () => ({
  component: DarkModeToggleButtonComponent,
  props:     {}
});
