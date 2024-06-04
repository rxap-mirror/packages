import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';

export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  /**
   * @deprecated use `targets.indexExport` instead
   */
  indexExport?: boolean;
  coerce?: boolean | Omit<AngularLibraryGeneratorSchema, 'name'>;
  skipFormat?: boolean;
  targets?: {
    indexExport?: boolean;
  }
}
