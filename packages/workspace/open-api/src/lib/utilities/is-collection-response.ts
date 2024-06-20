import { OpenAPIV3 } from 'openapi-types';
import { IsAnySchemaObject } from './any-schema-object';
import { GetResponse } from './get-response';
import { IsReferenceObject } from './is-reference-object';

/**
 * Determines if the given OpenAPI operation object represents a collection response.
 *
 * This function checks if the operation's response schema explicitly defines an array type,
 * indicating that the response is a collection of items rather than a single item. It first
 * retrieves the response schema from the operation object, then verifies that the schema
 * is neither a wildcard schema object nor a reference to another schema. If these conditions
 * are met and the response type is an array, the function returns true, indicating a collection
 * response.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object to evaluate.
 * @returns {boolean} True if the operation's response is a collection (array type), false otherwise.
 */
export function IsCollectionResponse(operation: OpenAPIV3.OperationObject): boolean {

  const response = GetResponse(operation);

  if (response && !IsAnySchemaObject(response)) {
    if (!IsReferenceObject(response)) {
      return response.type === 'array';
    }
  }

  return false;
}
