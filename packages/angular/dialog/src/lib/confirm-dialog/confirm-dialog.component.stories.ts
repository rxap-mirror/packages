import { Meta } from '@storybook/angular';
import { ConfirmDialogComponent } from './confirm-dialog.component';

export default {
  title: 'ConfirmDialogComponent',
  component: ConfirmDialogComponent,
} as Meta<ConfirmDialogComponent>;

export const Primary = {
  render: (args: ConfirmDialogComponent) => ({
    props: args,
  }),
  args: {},
};
