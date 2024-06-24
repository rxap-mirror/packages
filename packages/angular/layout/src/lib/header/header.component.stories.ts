import { provideLayout } from '@rxap/layout';
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
        provideLayout(),
      ]
    })
  ],
};
export default meta;
type Story = StoryObj<HeaderComponent>;

export const Primary: Story = {
  args: {},
};

