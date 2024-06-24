import type { Meta, StoryObj } from '@storybook/angular';
import { VersionComponent } from './version.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<VersionComponent> = {
  component: VersionComponent,
  title: 'SidenavComponent / VersionComponent',
};
export default meta;
type Story = StoryObj<VersionComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/version works!/gi)).toBeTruthy();
  },
};
