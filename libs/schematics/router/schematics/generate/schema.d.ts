export interface RoutingSchema {
  prefix: string | undefined;
  project: string;
  template: string;
  path: string | undefined;
  routingModule: string | undefined;
  organizeImports: boolean | undefined;
  openApiModule: string | undefined;
  fixImports: boolean;
  format: boolean;
  overwrite: boolean;
  feature: string | undefined;
  templateBasePath: string | undefined;
  skipTsFiles: boolean | undefined;
}
