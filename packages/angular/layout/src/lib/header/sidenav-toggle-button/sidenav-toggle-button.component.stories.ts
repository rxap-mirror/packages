import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { SidenavToggleButtonComponentModule } from './sidenav-toggle-button.component.module';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';

addDecorator(moduleMetadata({
  imports: [
    SidenavToggleButtonComponentModule,
  ],
}));

export default {
  title: 'SidenavToggleButtonComponent',
  component: SidenavToggleButtonComponent,
};

export const basic = () => ({
  component: SidenavToggleButtonComponent,
  props: {},
});
