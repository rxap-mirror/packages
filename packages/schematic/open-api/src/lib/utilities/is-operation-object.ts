import {OpenAPIV3} from 'openapi-types';

export function IsOperationObject(obj: any): obj is OpenAPIV3.OperationObject {
  return !!obj && !!obj['operationId'];
}
