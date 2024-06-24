import { provideLayout } from '../provide';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { DefaultHeaderComponent } from './default-header.component';

const meta: Meta<DefaultHeaderComponent> = {
  component: DefaultHeaderComponent,
  title: 'DefaultHeaderComponent',
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
type Story = StoryObj<DefaultHeaderComponent>;

export const Primary: Story = {
  args: {},
};

