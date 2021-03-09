export interface RoutingSchema {
  prefix?: string;
  project: string;
  template: string;
  path?: string;
  routingModule?: string;
  organizeImports: boolean;
  openApiModule?: string;
  fixImports: boolean;
  format: boolean;
  overwrite: boolean;
  feature?: string;
}
