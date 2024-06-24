import type { Meta, StoryObj } from '@storybook/angular';
import { SidenavComponent } from './sidenav.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<SidenavComponent> = {
  component: SidenavComponent,
  title: 'SidenavComponent',
};
export default meta;
type Story = StoryObj<SidenavComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/sidenav works!/gi)).toBeTruthy();
  },
};
