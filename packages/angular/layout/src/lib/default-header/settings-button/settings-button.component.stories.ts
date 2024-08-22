import type { Meta, StoryObj } from '@storybook/angular';
import { SettingsButtonComponent } from './settings-button.component';

const meta: Meta<SettingsButtonComponent> = {
  component: SettingsButtonComponent,
  title: 'DefaultHeaderComponent / SettingsButtonComponent',
};
export default meta;
type Story = StoryObj<SettingsButtonComponent>;

export const Primary: Story = {
  args: {},
};
