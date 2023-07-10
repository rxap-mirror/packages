import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { MessageDialogComponentModule } from './message-dialog.component.module';
import { MessageDialogComponent } from './message-dialog.component';

addDecorator(moduleMetadata({
  imports: [
    MessageDialogComponentModule,
  ],
}));

export default {
  title: 'MessageDialogComponent',
  component: MessageDialogComponent,
};

export const basic = () => ({
  component: MessageDialogComponent,
  props: {},
});
