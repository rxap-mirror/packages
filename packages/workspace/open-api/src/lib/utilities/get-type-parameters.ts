import { OpenAPIV3 } from 'openapi-types';
import {
  OptionalKind,
  TypeParameterDeclarationStructure,
} from 'ts-morph';
import { IsAnySchemaObject } from './any-schema-object';
import { GetRequestBody } from './get-reqeust-body';
import { GetResponse } from './get-response';
import { IsReferenceObject } from './is-reference-object';

/**
 * Extracts type parameters for the response and request body of a given OpenAPI operation object.
 * This function analyzes the operation's response and request body to determine if type parameters
 * should be defined based on the presence of additional properties or undefined types.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object to analyze.
 * @returns {Array<OptionalKind<TypeParameterDeclarationStructure>>} An array of type parameter declarations.
 * Each type parameter is represented with a name and a default type. If the operation's response or request body
 * has additional properties set to true or an undefined type, type parameters 'TResponse' and 'TRequestBody'
 * are added with a default type of 'unknown'.
 *
 * Note: The function assumes that the operation object is well-formed and contains the necessary properties
 * to perform checks on the response and request body. It returns an empty array if no type parameters are needed.
 */
export function GetTypeParameters(operation: OpenAPIV3.OperationObject): Array<OptionalKind<TypeParameterDeclarationStructure>> {

  const typeParameters: Array<OptionalKind<TypeParameterDeclarationStructure>> = [];

  if (operation.operationId) {

    const response = GetResponse(operation);
    const requestBody = GetRequestBody(operation);

    if (response && !IsAnySchemaObject(response) && !IsReferenceObject(response)) {
      if (response.additionalProperties === true || response.type === undefined) {
        typeParameters.push({
          name: 'TResponse',
          default: 'unknown',
        });
      }
    }

    if (requestBody && !IsAnySchemaObject(requestBody) && !IsReferenceObject(requestBody)) {
      if (requestBody.additionalProperties === true || requestBody.type === undefined) {
        typeParameters.push({
          name: 'TRequestBody',
          default: 'unknown',
        });
      }
    }

  }

  return typeParameters;

}
