import { classify } from '@rxap/utilities';
import { REQUEST_BODY_FILE_SUFFIX } from '../config';
import { GenerateParameter } from '../types';
import { IsAnySchemaObject } from './any-schema-object';
import { GetRequestBody } from './get-reqeust-body';
import { IsReferenceObject } from './is-reference-object';

export function GetRequestBodyType(operation: GenerateParameter<any>): { type: string, name: string | null } {

  let requestBodyType = 'void';
  let name: string | null = null;

  if (operation.operationId) {

    const requestBody = GetRequestBody(operation);

    if (requestBody === null) {
      requestBodyType = 'void';
    } else if (!IsAnySchemaObject(requestBody)) {
      name = requestBodyType = classify([ operation.operationId, REQUEST_BODY_FILE_SUFFIX ].join('-'));
      if (!IsReferenceObject(requestBody)) {
        if (requestBody.additionalProperties === true || requestBody.type === undefined) {
          requestBodyType += `<TRequestBody>`;
        }
      }
    } else {
      requestBodyType = 'any';
    }

  }

  return {
    type: requestBodyType,
    name,
  };

}
