export interface GenerateSchema {
  name?: string;
  path?: string;
  project?: string;
  flat?: boolean;
  template: string;
  openApiModule?: string;
  overwrite: boolean;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
}
