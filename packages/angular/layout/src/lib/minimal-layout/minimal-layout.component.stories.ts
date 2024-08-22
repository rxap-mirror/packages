import { provideLayout } from '../provide';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { MinimalLayoutComponent } from './minimal-layout.component';

const meta: Meta<MinimalLayoutComponent> = {
  component: MinimalLayoutComponent,
  title: 'MinimalLayoutComponent',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      providers: [provideLayout()],
    }),
  ],
};
export default meta;
type Story = StoryObj<MinimalLayoutComponent>;

export const Primary: Story = {
  args: {},
};
