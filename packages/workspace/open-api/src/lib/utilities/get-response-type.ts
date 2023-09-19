import { classify } from '@rxap/utilities';
import { OpenAPIV3 } from 'openapi-types';
import { RESPONSE_FILE_SUFFIX } from '../config';
import { IsAnySchemaObject } from './any-schema-object';
import { GetResponse } from './get-response';
import { IsReferenceObject } from './is-reference-object';

export function GetResponseType(operation: OpenAPIV3.OperationObject): { type: string, name: string | null } {

  let responseType = 'void';
  let name: string | null = null;

  if (operation.operationId) {

    const response = GetResponse(operation);

    // only generate the response interface if the type is not any
    if (response && !IsAnySchemaObject(response)) {
      name = responseType = classify([ operation.operationId, RESPONSE_FILE_SUFFIX ].join('-'));
      if (!IsReferenceObject(response)) {
        if (response.additionalProperties === true || response.type === undefined) {
          responseType += `<TResponse>`;
        }
      }
    } else {
      responseType = 'void';
    }

  }

  return {
    type: responseType,
    name,
  };

}
