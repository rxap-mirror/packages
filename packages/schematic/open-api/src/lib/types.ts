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

export interface OperationObjectWithMetadata extends OpenAPIV3.OperationObject {
  path: string;
  method: string;
}

export function GenerateParameterToOperationObjectWithMetadata(parameter: GenerateParameter): OperationObjectWithMetadata {
  const whitelist = [ 'method', 'path', 'operationId', 'parameters', 'responses', 'requestBody' ];
  const copy: any = {};
  for (const key of Object.keys(parameter).filter(k => whitelist.includes(k))) {
    copy[key] = (parameter as any)[key];
  }
  if (parameter.responses) {
    copy.responses = {};
    for (const status of
      Object.keys(parameter.responses).filter(status => Number(status) >= 200 && Number(status) < 300)) {
      copy.responses[status] = parameter.responses[status];
    }
  }

  function removeHumanProperties(obj: any): any {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => removeHumanProperties(item));
      }
    } else {
      return obj;
    }
    const clean: any = {};
    const blacklist = [ 'description', 'example', 'summary' ];
    for (const [ key, value ] of Object.entries(obj)) {
      if (!blacklist.includes(key)) {
        clean[key] = removeHumanProperties(value);
      }
    }
    return clean;
  }

  return removeHumanProperties(copy);
}

export function HasOperationId(operation: OpenAPIV3.OperationObject): operation is OperationObject {
  return !!operation.operationId;
}

export function AssertWithOperationId(operation: OpenAPIV3.OperationObject): asserts operation is OperationObject {
  if (!HasOperationId(operation)) {
    throw new Error('Ensure all operation have a operation id.');
  }
}

export type GeneratorFunction<Options extends OpenApiSchemaBase = OpenApiSchemaBase> = (parameters: GenerateParameter<Options>) => void;

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
