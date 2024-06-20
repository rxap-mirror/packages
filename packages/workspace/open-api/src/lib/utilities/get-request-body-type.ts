import { classify } from '@rxap/utilities';
import { REQUEST_BODY_FILE_SUFFIX } from '../config';
import { GenerateParameter } from '../types';
import { IsAnySchemaObject } from './any-schema-object';
import { GetRequestBody } from './get-reqeust-body';
import { IsReferenceObject } from './is-reference-object';

/**
 * Generates a description of the request body type for a given API operation.
 *
 * This function examines the specified operation to determine the type of its request body.
 * It returns an object containing the type as a string and an optional name for the type.
 * If the operation does not specify a request body, or if the body cannot be determined,
 * the type defaults to 'void'. If the body is of a generic or undefined type, it is classified
 * under a generated name using the operation ID and a suffix. If the body schema is too generic
 * (i.e., matches any schema), the type is set to 'any'.
 *
 * @param {GenerateParameter<any>} operation - The operation object to analyze, which should include
 * an operationId and potentially other metadata necessary
 * for determining the request body schema.
 * @returns {{ type: string, name: string | null }} An object containing:
 * - `type`: A string representing the determined type of the request body. Possible values
 * are 'void', a specific classified type name, or 'any'.
 * - `name`: An optional string representing a name for the request body type, which is
 * null if no specific name is applicable.
 */
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
