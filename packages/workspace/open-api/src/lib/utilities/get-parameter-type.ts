import { classify } from '@rxap/utilities';
import { OpenAPIV3 } from 'openapi-types';
import { PARAMETER_FILE_SUFFIX } from '../config';

/**
 * Generates a string representing the type of parameter for a given OpenAPI operation.
 *
 * This function examines the provided `operation` object to determine if it contains parameters and an operation ID.
 * If both are present, it constructs a parameter type string using the operation ID and a predefined suffix.
 * If either is absent, it defaults to returning 'void'.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object to analyze.
 * @returns {string} A string representing the parameter type. Returns 'void' if the necessary conditions are not met.
 */
export function GetParameterType(operation: OpenAPIV3.OperationObject): string {

  let parameterType = 'void';

  if (operation.parameters && operation.parameters.length && operation.operationId) {
    parameterType = classify([ operation.operationId, PARAMETER_FILE_SUFFIX ].join('-'));
  }

  return parameterType;

}
