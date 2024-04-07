import { StorybookConfigurationOptions } from '@nx/angular/src/generators/storybook-configuration/schema';

export interface InitApplicationGeneratorSchema extends Omit<StorybookConfigurationOptions, 'name'> {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  compodoc?: boolean;
}
