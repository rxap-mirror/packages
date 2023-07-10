import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';

import {UserProfileIconComponent} from './user-profile-icon.component';

addDecorator(moduleMetadata({
  imports: [],
}));

export default {
  title: 'UserProfileIconComponent',
  component: UserProfileIconComponent,
};

export const basic = () => ({
  component: UserProfileIconComponent,
  props: {},
});
