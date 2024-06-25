import {
  provideLayout,
  withDefaultHeaderComponent,
} from '../provide';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { HeaderComponent } from './header.component';

const meta: Meta<HeaderComponent> = {
  component: HeaderComponent,
  title: 'HeaderComponent',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      providers: [
        provideLayout(withDefaultHeaderComponent()),
      ]
    })
  ],
};
export default meta;
type Story = StoryObj<HeaderComponent>;

export const Primary: Story = {
  args: {},
};

