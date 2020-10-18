import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { ConfirmDialogComponentModule } from './confirm-dialog.component.module';
import { ConfirmDialogComponent } from './confirm-dialog.component';

addDecorator(moduleMetadata({
  imports: [
    ConfirmDialogComponentModule,
  ]
}));

export default {
  title:     'ConfirmDialogComponent',
  component: ConfirmDialogComponent
};

export const basic = () => ({
  component: ConfirmDialogComponent,
  props:     {}
});
