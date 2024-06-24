import { provideLayout } from '@rxap/layout';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { BaseLayoutComponent } from './base-layout.component';

const meta: Meta<BaseLayoutComponent> = {
  component: BaseLayoutComponent,
  title: 'BaseLayoutComponent',
  parameters: {
    layout: 'fullscreen',
    autoDocs: false,
  },
  decorators: [
    moduleMetadata({
      providers: [
        provideLayout(),
      ]
    }),
  ]
};
export default meta;
type Story = StoryObj<BaseLayoutComponent>;

export const Primary: Story = {
  args: {},
};
