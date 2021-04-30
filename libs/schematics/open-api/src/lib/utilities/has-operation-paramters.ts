import { OpenAPIV3 } from 'openapi-types';

export type OperationObjectWithParameters = Omit<OpenAPIV3.OperationObject, 'parameters'> & Required<Pick<OpenAPIV3.OperationObject, 'parameters'>>;

export function HasOperationParameters(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithParameters {
  return Array.isArray(operation.parameters) && operation.parameters.length !== 0;
}