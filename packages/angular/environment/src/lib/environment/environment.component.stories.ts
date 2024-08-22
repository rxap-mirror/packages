import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Environment } from '../environment';
import { ProvideEnvironment } from '../provide-environment';
import { EnvironmentComponent } from './environment.component';

const environment: Environment = {
  name: 'production',
  app: 'environment-storybook',
  production: true,
};

const meta: Meta<EnvironmentComponent> = {
  component: EnvironmentComponent,
  title: 'EnvironmentComponent',
  decorators: [
    moduleMetadata({
      providers: [ProvideEnvironment(environment)],
    }),
  ],
};
export default meta;
type Story = StoryObj<EnvironmentComponent>;

export const Primary: Story = {
  args: {},
};
