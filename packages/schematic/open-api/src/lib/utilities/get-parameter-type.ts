import {OpenAPIV3} from 'openapi-types';
import {classify} from '@rxap/schematics-utilities';
import {IsAnySchemaObject} from './any-schema-object';
import {PARAMETER_FILE_SUFFIX} from '../config';
import {GetResponse} from './get-response';

export function GetParameterType(operation: OpenAPIV3.OperationObject): string {

  let parameterType = 'void';

  if (operation.parameters && operation.parameters.length && operation.operationId) {
    parameterType = classify([operation.operationId, PARAMETER_FILE_SUFFIX].join('-'));
  }

  return parameterType;

}
