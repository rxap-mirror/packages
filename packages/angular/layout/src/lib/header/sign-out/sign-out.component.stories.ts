import type { Meta, StoryObj } from '@storybook/angular';
import { SignOutComponent } from './sign-out.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<SignOutComponent> = {
  component: SignOutComponent,
  title: 'HeaderComponent / SignOutComponent',
};
export default meta;
type Story = StoryObj<SignOutComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/sign-out works!/gi)).toBeTruthy();
  },
};
