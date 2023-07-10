import {OpenAPIV3} from 'openapi-types';
import {IsAnySchemaObject} from './any-schema-object';
import {GetResponse} from './get-response';
import {IsReferenceObject} from './is-reference-object';

export function IsCollectionResponse(operation: OpenAPIV3.OperationObject): boolean {

  const response = GetResponse(operation);

  if (response && !IsAnySchemaObject(response)) {
    if (!IsReferenceObject(response)) {
      return response.type === 'array';
    }
  }

  return false;
}
