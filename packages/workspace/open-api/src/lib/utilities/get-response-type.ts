import { classify } from '@rxap/utilities';
import { OpenAPIV3 } from 'openapi-types';
import { RESPONSE_FILE_SUFFIX } from '../config';
import { IsAnySchemaObject } from './any-schema-object';
import { GetResponse } from './get-response';
import { IsReferenceObject } from './is-reference-object';

/**
 * Determines the response type and name for a given OpenAPI operation.
 *
 * This function analyzes an OpenAPI operation object to ascertain the appropriate TypeScript type
 * and name for the response. It defaults to a type of 'void' if no specific response structure is defined
 * or if the response type is 'any'. If a valid response structure is found and it is not of type 'any',
 * the function generates a TypeScript type name based on the operation ID and a predefined suffix.
 * Additionally, if the response object is not a direct reference and either has additional properties
 * or an undefined type, a generic type parameter 'TResponse' is appended to the response type.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object to analyze.
 * @returns {{ type: string, name: string | null }} An object containing the 'type' as a string
 * indicating the TypeScript type of the response, and 'name', which is either a string
 * representing the generated type name or null if no specific type name is generated.
 */
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
