import type { Meta, StoryObj } from '@storybook/angular';
import { UserProfileIconComponent } from './user-profile-icon.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<UserProfileIconComponent> = {
  component: UserProfileIconComponent,
  title: 'HeaderComponent / UserProfileIconComponent',
};
export default meta;
type Story = StoryObj<UserProfileIconComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/user-profile-icon works!/gi)).toBeTruthy();
  },
};
