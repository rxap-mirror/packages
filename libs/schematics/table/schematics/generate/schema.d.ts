export interface GenerateSchema {
  skipTsFiles: boolean | undefined;
  name: string | undefined;
  path: string | undefined;
  project: string | undefined;
  flat: boolean | undefined;
  template: string;
  openApiModule: string | undefined;
  overwrite: boolean;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
  templateBasePath: string | undefined;
}
