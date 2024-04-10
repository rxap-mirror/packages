import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';

export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  indexExport?: boolean;
  compodoc?: boolean;
  coerce?: boolean | Omit<AngularLibraryGeneratorSchema, 'name'>;
  skipFormat?: boolean;
}
