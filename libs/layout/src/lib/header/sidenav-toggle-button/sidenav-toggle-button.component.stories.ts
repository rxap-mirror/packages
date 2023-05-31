import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'SidenavToggleButtonComponent',
  component: SidenavToggleButtonComponent
};

export const basic = () => ({
  component: SidenavToggleButtonComponent,
  props:     {}
});
