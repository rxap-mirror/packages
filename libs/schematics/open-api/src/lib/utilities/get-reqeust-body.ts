import { OpenAPIV3 } from 'openapi-types';
import { AnySchemaObject } from './any-schema-object';
import { IsReferenceObject } from './is-reference-object';

export function GetRequestBody(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject {

  if (operation.requestBody) {

    if (IsReferenceObject(operation.requestBody)) {
      throw new Error('Reference object are not supported in operation requestBody!');
    }

    const requestBodies: Record<string, OpenAPIV3.MediaTypeObject> | undefined = operation.requestBody.content;

    if (requestBodies) {

      if (IsReferenceObject(requestBodies)) {
        console.warn('Reference object are not supported in operation requestBody!');
      } else {
        if (requestBodies.hasOwnProperty('application/json')) {
          const schema = requestBodies[ 'application/json' ].schema;
          if (schema) {
            return schema;
          }
        }
      }

    }

  }

  return {
    type: 'any'
  };

}