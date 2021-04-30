import { OpenAPIV3 } from 'openapi-types';
import { GetRequestBody } from './get-reqeust-body';
import { IsAnySchemaObject } from './any-schema-object';
import { classify } from '@rxap/utilities';
import { REQUEST_BODY_FILE_SUFFIX } from '../config';

export function GetRequestBodyType(operation: OpenAPIV3.OperationObject): string {

  let requestBodyType = 'void';

  if (operation.operationId) {

    const requestBody = GetRequestBody(operation);

    if (!IsAnySchemaObject(requestBody)) {

      requestBodyType = classify([ operation.operationId, REQUEST_BODY_FILE_SUFFIX ].join('-'));

    } else {
      requestBodyType = 'any';
    }

  }

  return requestBodyType;

}