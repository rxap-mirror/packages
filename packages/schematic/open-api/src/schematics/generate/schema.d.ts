export interface OpenApiSchemaBase {
  project: string;
  transport?: 'amplify';
  debug?: boolean;
  prefix: string;
  export?: boolean;
  serverId?: string;
  inline?: boolean;
  directory?: string;
  skipRemoteMethod: boolean;
  skipCommand: boolean;
  skipProvider: boolean;
  skipDirectives: boolean;
  skipDataSource: boolean;
}

export interface OpenApiSchemaFromPath extends OpenApiSchemaBase {
  path: string;
}

export interface OpenApiSchemaFromUrl extends OpenApiSchemaBase {
  url: string;
}

export type OpenApiSchema = OpenApiSchemaFromPath | OpenApiSchemaFromUrl;
