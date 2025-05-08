import {
  GetResponse,
  IsAnySchemaObject,
  IsReferenceObject,
} from '@rxap/workspace-open-api';
import { OpenAPIV3 } from 'openapi-types';

export function hasResponseAdditionalProperties(operation: OpenAPIV3.OperationObject) {
  if (operation.operationId) {

    const response = GetResponse(operation);
    if (response && !IsAnySchemaObject(response)) {
      if (!IsReferenceObject(response)) {
        return response.additionalProperties === true || response.type === undefined;
      }
    }
  }
  return false;
}
