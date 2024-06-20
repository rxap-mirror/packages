import { OpenAPIV3 } from 'openapi-types';

/**
 * Checks if a given object is a valid OpenAPIV3 OperationObject based on the presence of an `operationId` property.
 *
 * An OpenAPI OperationObject typically represents a single API operation on a path and must have an `operationId` which is a unique string used to identify the operation.
 *
 * @param obj - The object to be checked.
 * @returns `true` if the object has a property `operationId` indicating it's likely an OpenAPIV3 OperationObject, otherwise `false`.
 * @example
 *
 * const apiOperation = {
 * operationId: 'getUser',
 * summary: 'Gets a user by ID'
 * };
 * console.log(IsOperationObject(apiOperation)); // Output: true
 * ```
 */
export function IsOperationObject(obj: any): obj is OpenAPIV3.OperationObject {
  return !!obj && !!obj['operationId'];
}
