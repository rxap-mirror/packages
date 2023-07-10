import {OpenAPIV3} from 'openapi-types';

export type OperationObjectWithRequestBody =
  Omit<OpenAPIV3.OperationObject, 'requestBody'>
  & Required<Pick<OpenAPIV3.OperationObject, 'requestBody'>>;

export function HasOperationRequestBody(operation: OpenAPIV3.OperationObject): operation is OperationObjectWithRequestBody {
  return !!operation.requestBody
}
