import type { Meta, StoryObj } from '@storybook/angular';
import { AppsButtonComponent } from './apps-button.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<AppsButtonComponent> = {
  component: AppsButtonComponent,
  title: 'HeaderComponent / AppsButtonComponent',
};
export default meta;
type Story = StoryObj<AppsButtonComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/apps-button works!/gi)).toBeTruthy();
  },
};
