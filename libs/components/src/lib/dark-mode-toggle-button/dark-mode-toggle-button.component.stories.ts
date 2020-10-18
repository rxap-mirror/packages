import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { DarkModeToggleButtonComponentModule } from './dark-mode-toggle-button.component.module';
import { DarkModeToggleButtonComponent } from './dark-mode-toggle-button.component';

addDecorator(moduleMetadata({
  imports: [
    DarkModeToggleButtonComponentModule,
  ]
}));

export default {
  title:     'DarkModeToggleButtonComponent',
  component: DarkModeToggleButtonComponent
};

export const basic = () => ({
  component: DarkModeToggleButtonComponent,
  props:     {}
});
