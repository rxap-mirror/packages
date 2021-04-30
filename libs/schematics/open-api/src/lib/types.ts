import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';

export type OperationObject = Omit<OpenAPIV3.OperationObject, 'operationId'> & { operationId: string };

export interface GenerateParameter<Options extends OpenApiSchemaBase = OpenApiSchemaBase> extends OperationObject {
  method: string;
  path: string;
  project: Project;
  components: OpenAPIV3.ComponentsObject;
  options: Options;
}

export function HasOperationId(operation: OpenAPIV3.OperationObject): operation is OperationObject {
  return !!operation.operationId
}

export function AssertWithOperationId(operation: OpenAPIV3.OperationObject): asserts operation is OperationObject {
  if (!HasOperationId(operation)) {
    throw new Error('Ensure all operation have a operation id.')
  }
}

export type GeneratorFunction<Options extends OpenApiSchemaBase = OpenApiSchemaBase> = (parameters: GenerateParameter<Options>) => Promise<void>;

export interface OpenApiSchemaBase {
  debug?: boolean;
}

export interface OpenApiSchemaFromPath extends OpenApiSchemaBase {
  path: string;
}

export interface OpenApiSchemaFromUrl extends OpenApiSchemaBase {
  url: string;
}

export type OpenApiSchema = OpenApiSchemaFromPath | OpenApiSchemaFromUrl;
