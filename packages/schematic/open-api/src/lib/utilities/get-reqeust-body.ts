import { OpenAPIV3 } from 'openapi-types';
import { AnySchemaObject } from './any-schema-object';
import { IsReferenceObject } from './is-reference-object';
import { IsRecord } from '@rxap/schematics-utilities';

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
