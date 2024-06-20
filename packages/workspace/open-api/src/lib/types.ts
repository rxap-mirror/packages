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

/**
 * Generates a sanitized OperationObject with metadata from a given parameter object, filtering out non-essential properties.
 * This function is particularly useful for creating lightweight API operation objects that are stripped of human-readable properties
 * which are not necessary for programmatic processing.
 *
 * @param {GenerateParameter} parameter - The source parameter object containing properties like method, path, operationId, parameters, responses, and requestBody.
 * @returns {OperationObjectWithMetadata} A new object containing only essential API operation data, excluding human-readable properties such as descriptions or examples.
 *
 * The function performs the following operations:
 * 1. Filters and copies properties from the input parameter that are listed in a predefined whitelist.
 * 2. Further filters the `responses` property to include only successful responses (HTTP status codes 200-299).
 * 3. Recursively removes properties listed in a blacklist (e.g., 'description', 'example', 'summary') from the object to ensure the output is suitable for programmatic use.
 *
 * Note: This function assumes that the input parameter object's structure aligns with typical API operation specifications.
 */
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

/**
 * Checks if the provided OpenAPI operation object contains a non-empty `operationId`.
 *
 * The `operationId` is a unique string used to identify the operation. The presence of an `operationId` is essential for various tools and libraries that parse and utilize OpenAPI specifications, enabling unique operation referencing and handling.
 *
 * @param operation - The OpenAPI operation object to check.
 * @returns `true` if `operationId` is present and not empty, otherwise `false`.
 *
 * @example
 *
 * const operation = { operationId: "getUserById" };
 * console.log(HasOperationId(operation)); // Output: true
 * ```
 */
export function HasOperationId(operation: OpenAPIV3.OperationObject): operation is OperationObject {
  return !!operation.operationId;
}

/**
 * Asserts that the given OpenAPI operation object contains a valid operation ID.
 *
 * This function is a type guard that ensures the provided operation object adheres to the expected structure
 * with a defined operation ID. If the operation object does not have an operation ID, it throws an error.
 * This is particularly useful for enforcing that all operations in an OpenAPI specification include an
 * operation ID, which is crucial for certain API tools and libraries that rely on this identifier.
 *
 * @param operation - The OpenAPI operation object to be validated.
 * @throws {Error} Throws an error if the operation object does not have an operation ID.
 */
export function AssertWithOperationId(operation: OpenAPIV3.OperationObject): asserts operation is OperationObject {
  if (!HasOperationId(operation)) {
    throw new Error('Ensure all operation have a operation id.');
  }
}

export type GeneratorFunction<Options extends OpenApiSchemaBase = OpenApiSchemaBase> = (parameters: GenerateParameter<Options>) => void;

export interface OpenApiSchemaBase {
  debug?: boolean;
  /**
   * If the packageName property is set.
   * The generation of the open api client sdk will be done to be published as a npm package.
   */
  packageName?: string;
  serverId?: string;
  prefix?: string;
}

export interface OpenApiSchemaFromPath extends OpenApiSchemaBase {
  path: string;
}

export interface OpenApiSchemaFromUrl extends OpenApiSchemaBase {
  url: string;
}

export type OpenApiSchema = OpenApiSchemaFromPath | OpenApiSchemaFromUrl;
