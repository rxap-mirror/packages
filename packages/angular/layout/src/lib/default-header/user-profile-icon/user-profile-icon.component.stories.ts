import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/angular';
import { UserProfileIconComponent } from './user-profile-icon.component';

const meta: Meta<UserProfileIconComponent> = {
  component: UserProfileIconComponent,
  title: 'DefaultHeaderComponent / UserProfileIconComponent',
};
export default meta;
type Story = StoryObj<UserProfileIconComponent>;

export const Primary: Story = {
  args: {
    profile: { username: faker.internet.userName() },
  },
};
