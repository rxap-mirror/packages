import { OpenAPIV3 } from 'openapi-types';
import { AnySchemaObject } from './any-schema-object';
import { IsReferenceObject } from './is-reference-object';

/**
 * Extracts the JSON schema from a specified operation's responses in an OpenAPI 3.0 specification.
 *
 * This function navigates through the responses of an OpenAPI operation object to find and return the JSON schema
 * associated with the response content type 'application/json'. It prioritizes the default response, followed by
 * HTTP 200 and 201 status codes. If a response is found, the function checks if it is a reference object or an actual
 * response object. For reference objects, a warning is logged indicating that reference objects are not supported.
 * If an actual response object with a 'application/json' content type is found, the associated schema is returned.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object containing the responses to be analyzed.
 * @returns {OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject | null} The JSON schema associated with
 * the operation's response if available, otherwise null. Note that reference objects are recognized but not supported.
 */
export function GetResponse(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject | null {

  if (operation.responses) {

    let response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject | undefined = undefined;

    if (operation.responses['default']) {
      response = operation.responses['default'];
    } else if (operation.responses['200']) {
      response = operation.responses['200'];
    } else if (operation.responses['201']) {
      response = operation.responses['201'];
    }

    if (response) {

      if (IsReferenceObject(response)) {
        console.warn('Reference object are not supported in operation responses!');
      } else {
        if (response.content && response.content['application/json']) {
          const schema = response.content['application/json'].schema;
          if (schema) {
            return schema;
          }
        }
      }

    }

  }

  return null;

}
