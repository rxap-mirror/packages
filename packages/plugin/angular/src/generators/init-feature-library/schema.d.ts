import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';

export interface InitFeatureLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
  routes?: boolean;
  targets?: {
    indexExport?: boolean;
  }
}
