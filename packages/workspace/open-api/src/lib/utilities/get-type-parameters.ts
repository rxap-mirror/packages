import { OpenAPIV3 } from 'openapi-types';
import {
  OptionalKind,
  TypeParameterDeclarationStructure,
} from 'ts-morph';
import { IsAnySchemaObject } from './any-schema-object';
import { GetRequestBody } from './get-reqeust-body';
import { GetResponse } from './get-response';
import { IsReferenceObject } from './is-reference-object';

export function GetTypeParameters(operation: OpenAPIV3.OperationObject): Array<OptionalKind<TypeParameterDeclarationStructure>> {

  const typeParameters: Array<OptionalKind<TypeParameterDeclarationStructure>> = [];

  if (operation.operationId) {

    const response = GetResponse(operation);
    const requestBody = GetRequestBody(operation);

    if (response && !IsAnySchemaObject(response) && !IsReferenceObject(response)) {
      if (response.additionalProperties === true) {
        typeParameters.push({
          name: 'TResponse',
          default: 'unknown',
        });
      }
    }

    if (requestBody && !IsAnySchemaObject(requestBody) && !IsReferenceObject(requestBody)) {
      if (requestBody.additionalProperties === true) {
        typeParameters.push({
          name: 'TRequestBody',
          default: 'unknown',
        });
      }
    }

  }

  return typeParameters;

}
