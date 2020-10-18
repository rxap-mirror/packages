import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { CheckboxHeaderCellComponentModule } from './checkbox-header-cell.component.module';
import { CheckboxHeaderCellComponent } from './checkbox-header-cell.component';

addDecorator(moduleMetadata({
  imports: [
    CheckboxHeaderCellComponentModule,
  ]
}));

export default {
  title:     'CheckboxHeaderCellComponent',
  component: CheckboxHeaderCellComponent
};

export const basic = () => ({
  component: CheckboxHeaderCellComponent,
  props:     {}
});
