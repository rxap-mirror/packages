import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { OverviewComponentModule } from './overview.component.module';
import { OverviewComponent } from './overview.component';

addDecorator(moduleMetadata({
  imports: [
    OverviewComponentModule
  ]
}));

export default {
  title:     'OverviewComponent',
  component: OverviewComponent
};

export const basic = () => ({
  component: OverviewComponent,
  props:     {}
});
