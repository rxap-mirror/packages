import type { Meta, StoryObj } from '@storybook/angular';
import { NavigationItemComponent } from './navigation-item.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<NavigationItemComponent> = {
  component: NavigationItemComponent,
  title: 'NavigationComponent / NavigationItemComponent',
};
export default meta;
type Story = StoryObj<NavigationItemComponent>;

export const Primary: Story = {
  args: {
    level: 0,
  },
};

export const Heading: Story = {
  args: {
    level: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/navigation-item works!/gi)).toBeTruthy();
  },
};
