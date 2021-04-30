import { OpenAPIV3 } from 'openapi-types';
import { RESPONSE_FILE_SUFFIX } from '../config';
import { IsAnySchemaObject } from './any-schema-object';
import { GetResponse } from './get-response';
import { classify } from '@rxap/utilities';

export function GetResponseType(operation: OpenAPIV3.OperationObject): string {

  let responseType = 'any';

  if (operation.operationId) {

    const response = GetResponse(operation);

    // only generate the response interface if the type is not any
    if (!IsAnySchemaObject(response)) {
      responseType = classify([ operation.operationId, RESPONSE_FILE_SUFFIX ].join('-'));
    } else {
      responseType = 'void';
    }

  }

  return responseType;

}
