import type { Meta, StoryObj } from '@storybook/angular';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<SidenavToggleButtonComponent> = {
  component: SidenavToggleButtonComponent,
  title: 'HeaderComponent / SidenavToggleButtonComponent',
};
export default meta;
type Story = StoryObj<SidenavToggleButtonComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/sidenav-toggle-button works!/gi)).toBeTruthy();
  },
};
