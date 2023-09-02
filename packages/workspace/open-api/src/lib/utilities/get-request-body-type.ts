import { classify } from '@rxap/utilities';
import { REQUEST_BODY_FILE_SUFFIX } from '../config';
import { GenerateParameter } from '../types';
import { IsAnySchemaObject } from './any-schema-object';
import { GetRequestBody } from './get-reqeust-body';

export function GetRequestBodyType(operation: GenerateParameter<any>): string {

  let requestBodyType = 'void';

  if (operation.operationId) {

    const requestBody = GetRequestBody(operation);

    if (requestBody === null) {
      requestBodyType = 'void';
    } else if (!IsAnySchemaObject(requestBody)) {
      requestBodyType = classify([ operation.operationId, REQUEST_BODY_FILE_SUFFIX ].join('-'));
    } else {
      requestBodyType = 'any';
    }

  }

  return requestBodyType;

}
