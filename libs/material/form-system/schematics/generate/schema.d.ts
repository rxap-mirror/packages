export interface GenerateSchema {
  name?: string;
  path?: string;
  overwrite?: boolean;
  project: string;
  template: string;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
}
