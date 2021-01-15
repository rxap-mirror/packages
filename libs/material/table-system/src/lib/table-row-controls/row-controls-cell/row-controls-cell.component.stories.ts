import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { RowControlsCellComponentModule } from './row-controls-cell.component.module';
import { RowControlsCellComponent } from './row-controls-cell.component';

addDecorator(moduleMetadata({
  imports: [
    RowControlsCellComponentModule
  ]
}));

export default {
  title:     'RowControlsCellComponent',
  component: RowControlsCellComponent
};

export const basic = () => ({
  component: RowControlsCellComponent,
  props:     {}
});
