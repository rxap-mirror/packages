export interface MicroserviceOptions {
  name: string;
  dsn?: string;
  directory: string;
  imageRegistry?: string;
  imageName?: string;
  imageSuffix?: string;
  apiPrefix?: string;
  port?: number;
  randomPort?: boolean;
  apiConfigurationFile?: string;
  overwrite: boolean;
  openApi: boolean;
  jwt: boolean;
}
