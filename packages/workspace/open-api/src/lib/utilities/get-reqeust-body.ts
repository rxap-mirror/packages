import { IsRecord } from '@rxap/utilities';
import { OpenAPIV3 } from 'openapi-types';
import { AnySchemaObject } from './any-schema-object';
import { IsReferenceObject } from './is-reference-object';

/**
 * Extracts the schema object from the request body of an OpenAPI operation.
 *
 * This function analyzes the `requestBody` of a given OpenAPI operation object to retrieve the schema definition
 * for the 'application/json' media type. It ensures that the requestBody is not a reference object, as reference
 * objects are not supported by this function. If the requestBody or the 'application/json' media type does not
 * contain a schema, the function returns null.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object containing the requestBody from which the schema is to be extracted.
 * @returns {OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject | null} The schema object associated with the 'application/json' media type if available, otherwise null.
 * @throws {Error} Throws an error if the requestBody itself is a reference object.
 */
export function GetRequestBody(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject | null {

  if (operation.requestBody) {

    if (IsReferenceObject(operation.requestBody)) {
      throw new Error('Reference object are not supported in operation requestBody!');
    }

    const requestBodies: Record<string, OpenAPIV3.MediaTypeObject> | undefined = operation.requestBody.content;

    if (IsRecord(requestBodies)) {

      if (IsReferenceObject(requestBodies)) {
        console.warn('Reference object are not supported in operation requestBody!');
      } else {
        if (requestBodies['application/json']) {
          const schema = requestBodies['application/json']['schema'];
          if (schema) {
            return schema;
          }
        }
      }

    }

  }

  return null;

}
