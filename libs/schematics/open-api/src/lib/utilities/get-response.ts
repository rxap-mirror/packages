import { OpenAPIV3 } from 'openapi-types';
import { AnySchemaObject } from './any-schema-object';
import { IsReferenceObject } from './is-reference-object';

export function GetResponse(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject {

  if (operation.responses) {

    // tslint:disable:no-unnecessary-initializer
    let response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject | undefined = undefined;

    if (operation.responses.hasOwnProperty('default')) {
      response = operation.responses.default;
    } else if (operation.responses.hasOwnProperty('200')) {
      response = operation.responses[ '200' ];
    } else if (operation.responses.hasOwnProperty('201')) {
      response = operation.responses[ '201' ];
    }

    if (response) {

      if (IsReferenceObject(response)) {
        console.warn('Reference object are not supported in operation responses!');
      } else {
        if (response.content && response.content.hasOwnProperty('application/json')) {
          const schema = response.content[ 'application/json' ].schema;
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