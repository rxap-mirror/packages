import { OpenAPIV3 } from 'openapi-types';

export type OperationObjectWithParameters =
  Omit<OpenAPIV3.OperationObject, 'parameters'>
  & Required<Pick<OpenAPIV3.OperationObject, 'parameters'>>;

/**
 * Checks if the provided OpenAPI operation object has any parameters defined.
 *
 * This function is a type guard that determines whether the `operation` object
 * conforms to the `OperationObjectWithParameters` type, which is an extension
 * of the standard `OpenAPIV3.OperationObject` with a non-empty `parameters` array.
 *
 * @param operation - The OpenAPI operation object to check.
 * @returns `true` if the `operation` object has a non-empty array of parameters, `false` otherwise.
 */
export function HasOperationParameters(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithParameters {
  return Array.isArray(operation.parameters) && operation.parameters.length !== 0;
}
