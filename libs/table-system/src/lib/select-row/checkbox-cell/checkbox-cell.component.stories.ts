import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { CheckboxCellComponentModule } from './checkbox-cell.component.module';
import { CheckboxCellComponent } from './checkbox-cell.component';

addDecorator(moduleMetadata({
  imports: [
    CheckboxCellComponentModule,
  ]
}));

export default {
  title:     'CheckboxCellComponent',
  component: CheckboxCellComponent
};

export const basic = () => ({
  component: CheckboxCellComponent,
  props:     {}
});
