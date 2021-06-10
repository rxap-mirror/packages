export interface GenerateSchema {
  skipTsFiles: boolean | undefined;
  name: string | undefined;
  path: string | undefined;
  overwrite: boolean | undefined;
  project: string;
  template: string;
  openApiModule: string | undefined;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
  templateBasePath: string | undefined;
}
