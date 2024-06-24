import { provideLayout } from '@rxap/layout';
import {
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { AppsButtonComponent } from './apps-button.component';

const meta: Meta<AppsButtonComponent> = {
  component: AppsButtonComponent,
  title: 'HeaderComponent / AppsButtonComponent',
  decorators: [
    moduleMetadata({
      providers: [
        provideLayout(),
      ]
    })
  ],
};
export default meta;
type Story = StoryObj<AppsButtonComponent>;

export const Primary: Story = {
  args: {},
};
