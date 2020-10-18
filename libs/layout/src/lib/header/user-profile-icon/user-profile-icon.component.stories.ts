import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { UserProfileIconComponentModule } from './user-profile-icon.component.module';
import { UserProfileIconComponent } from './user-profile-icon.component';

addDecorator(moduleMetadata({
  imports: [
    UserProfileIconComponentModule,
  ]
}));

export default {
  title:     'UserProfileIconComponent',
  component: UserProfileIconComponent
};

export const basic = () => ({
  component: UserProfileIconComponent,
  props:     {}
});
