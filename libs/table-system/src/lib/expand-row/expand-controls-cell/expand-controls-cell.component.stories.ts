import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { ExpandControlsCellComponentModule } from './expand-controls-cell.component.module';
import { ExpandControlsCellComponent } from './expand-controls-cell.component';

addDecorator(moduleMetadata({
  imports: [
    ExpandControlsCellComponentModule
  ]
}));

export default {
  title:     'ExpandControlsCellComponent',
  component: ExpandControlsCellComponent
};

export const basic = () => ({
  component: ExpandControlsCellComponent,
  props:     {}
});
