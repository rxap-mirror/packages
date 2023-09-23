import { Meta } from '@storybook/angular';
import { MessageDialogComponent } from './message-dialog.component';

export default {
  title: 'MessageDialogComponent',
  component: MessageDialogComponent,
} as Meta<MessageDialogComponent>;

export const Primary = {
  render: (args: MessageDialogComponent) => ({
    props: args,
  }),
  args: {},
};
