import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { NavigationProgressBarComponentModule } from './navigation-progress-bar.component.module';
import { NavigationProgressBarComponent } from './navigation-progress-bar.component';

addDecorator(moduleMetadata({
  imports: [
    NavigationProgressBarComponentModule,
  ]
}));

export default {
  title:     'NavigationProgressBarComponent',
  component: NavigationProgressBarComponent
};

export const basic = () => ({
  component: NavigationProgressBarComponent,
  props:     {}
});
