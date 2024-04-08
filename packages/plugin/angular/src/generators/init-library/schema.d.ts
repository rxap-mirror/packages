export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  indexExport?: boolean;
  compodoc?: boolean;
  coerce?: boolean;
}
