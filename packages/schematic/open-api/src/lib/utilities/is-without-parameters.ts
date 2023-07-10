import {OpenAPIV3} from 'openapi-types';

export type OperationObjectWithoutParameters = Omit<OpenAPIV3.OperationObject, 'parameters'>;

export function IsWithoutParameters(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithoutParameters {
  return !operation.parameters || !operation.parameters.length;
}
