import type { Meta, StoryObj } from '@storybook/angular';
import { BaseLayoutComponent } from './base-layout.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<BaseLayoutComponent> = {
  component: BaseLayoutComponent,
  title: 'BaseLayoutComponent',
  parameters: {
    layout: 'fullscreen',
  }
};
export default meta;
type Story = StoryObj<BaseLayoutComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/base-layout works!/gi)).toBeTruthy();
  },
};
