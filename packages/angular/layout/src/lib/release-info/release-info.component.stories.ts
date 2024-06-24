import { faker } from '@faker-js/faker';
import { ProvideReleaseInfoModule } from '@rxap/layout';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular';
import { ReleaseInfoComponent } from './release-info.component';


const meta: Meta<ReleaseInfoComponent> = {
  component: ReleaseInfoComponent,
  title: 'ReleaseInfoComponent',
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  }
};
export default meta;
type Story = StoryObj<ReleaseInfoComponent>;

export const Primary: Story = {
  args: {},
};

export const WithModules: Story = {
  args: {},
  decorators: [
    moduleMetadata({
      providers: [
        ProvideReleaseInfoModule([
          {
            name: faker.commerce.productName(),
            version: faker.system.semver(),
            hash: faker.git.commitSha({ length: 7 }),
          },
          {
            name: faker.commerce.productName(),
            version: faker.system.semver(),
          },
          {
            name: faker.commerce.productName(),
            version: faker.system.semver(),
            hash: faker.git.commitSha({ length: 7 }),
          }
        ])
      ]
    }),
  ]
};
