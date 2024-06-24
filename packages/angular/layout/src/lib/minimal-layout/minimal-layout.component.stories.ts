import type { Meta, StoryObj } from '@storybook/angular';
import { MinimalLayoutComponent } from './minimal-layout.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<MinimalLayoutComponent> = {
  component: MinimalLayoutComponent,
  title: 'MinimalLayoutComponent',
  parameters: {
    layout: 'fullscreen',
  }
};
export default meta;
type Story = StoryObj<MinimalLayoutComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/minimal-layout works!/gi)).toBeTruthy();
  },
};
