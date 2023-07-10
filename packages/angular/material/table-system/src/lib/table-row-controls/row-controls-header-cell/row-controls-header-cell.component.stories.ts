import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';
import {RowControlsHeaderCellComponentModule} from './row-controls-header-cell.component.module';
import {RowControlsHeaderCellComponent} from './row-controls-header-cell.component';

addDecorator(moduleMetadata({
  imports: [
    RowControlsHeaderCellComponentModule,
  ],
}));

export default {
  title: 'RowControlsHeaderCellComponent',
  component: RowControlsHeaderCellComponent,
};

export const basic = () => ({
  component: RowControlsHeaderCellComponent,
  props: {},
});
