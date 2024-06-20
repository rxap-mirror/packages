import { OpenAPIV3 } from 'openapi-types';

export type OperationObjectWithRequestBody =
  Omit<OpenAPIV3.OperationObject, 'requestBody'>
  & Required<Pick<OpenAPIV3.OperationObject, 'requestBody'>>;

/**
 * Checks if the provided OpenAPI operation object includes a request body.
 *
 * This function is a type guard that determines whether the `operation` object
 * conforms to the `OperationObjectWithRequestBody` interface, which is an extension
 * of the standard OpenAPIV3 `OperationObject` that includes a `requestBody`.
 *
 * @param operation - The OpenAPI operation object to check.
 * @returns `true` if the `operation` includes a `requestBody`, otherwise `false`.
 */
export function HasOperationRequestBody(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithRequestBody {
  return !!operation.requestBody;
}
