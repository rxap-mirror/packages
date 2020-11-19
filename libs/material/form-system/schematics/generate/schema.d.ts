export interface GenerateSchema {
  name?: string;
  path?: string;
  overwrite?: boolean;
  project: string;
  template: string;
  openApiModule?: string;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
}
