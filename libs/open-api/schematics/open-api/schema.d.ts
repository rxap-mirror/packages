export interface OpenApiSchemaBase {
  target: string;
  transport?: 'amplify'
}

export interface OpenApiSchemaFromPath extends OpenApiSchemaBase {
  path: string;
}

export interface OpenApiSchemaFromUrl extends OpenApiSchemaBase {
  url: string;
}

export type OpenApiSchema = OpenApiSchemaFromPath | OpenApiSchemaFromUrl;
