import { StorybookConfigurationOptions } from '@nx/angular/src/generators/storybook-configuration/schema';

export interface InitLibraryGeneratorSchema {
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  indexExport?: boolean;
  storybook?: Omit<StorybookConfigurationOptions, 'name'> | boolean;
  compodoc?: boolean;
}
