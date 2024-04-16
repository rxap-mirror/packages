import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';

export interface InitFeatureLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  coerce?: boolean | Omit<AngularLibraryGeneratorSchema, 'name'>;
  skipFormat?: boolean;
}
