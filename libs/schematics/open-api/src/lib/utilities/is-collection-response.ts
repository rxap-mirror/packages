import {
  GetResponse,
  IsAnySchemaObject,
  IsReferenceObject
} from '@rxap/schematics-open-api';
import { OpenAPIV3 } from 'openapi-types';

export function IsCollectionResponse(operation: OpenAPIV3.OperationObject): boolean {

  const response = GetResponse(operation);

  if (!IsAnySchemaObject(response)) {
    if (!IsReferenceObject(response)) {
      return response.type === 'array';
    }
  }

  return false;
}
