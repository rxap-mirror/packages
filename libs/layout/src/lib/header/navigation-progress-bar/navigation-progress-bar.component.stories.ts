import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { NavigationProgressBarComponent } from './navigation-progress-bar.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'NavigationProgressBarComponent',
  component: NavigationProgressBarComponent
};

export const basic = () => ({
  component: NavigationProgressBarComponent,
  props:     {}
});
