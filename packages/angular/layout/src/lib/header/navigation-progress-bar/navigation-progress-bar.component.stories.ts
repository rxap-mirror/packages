import type { Meta, StoryObj } from '@storybook/angular';
import { NavigationProgressBarComponent } from './navigation-progress-bar.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<NavigationProgressBarComponent> = {
  component: NavigationProgressBarComponent,
  title: 'HeaderComponent / NavigationProgressBarComponent',
};
export default meta;
type Story = StoryObj<NavigationProgressBarComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/navigation-progress-bar works!/gi)).toBeTruthy();
  },
};
