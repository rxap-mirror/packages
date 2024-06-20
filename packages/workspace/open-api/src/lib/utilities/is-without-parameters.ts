import { OpenAPIV3 } from 'openapi-types';

export type OperationObjectWithoutParameters = Omit<OpenAPIV3.OperationObject, 'parameters'>;

/**
 * Checks if the provided OpenAPI operation object does not contain any parameters.
 *
 * This function is a type guard that determines whether the `operation` object passed to it
 * conforms to the `OperationObjectWithoutParameters` type, which is a subtype of the standard
 * OpenAPI operation object that specifically has no parameters.
 *
 * @param operation - The OpenAPI operation object to check.
 * @returns `true` if the operation object has no parameters or an empty parameters array, otherwise `false`.
 */
export function IsWithoutParameters(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithoutParameters {
  return !operation.parameters || !operation.parameters.length;
}
