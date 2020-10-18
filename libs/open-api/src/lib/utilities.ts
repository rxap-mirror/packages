import { OpenAPIV3 } from 'openapi-types';
import { RxapOpenApiError } from './error';

export function IsReferenceObject(obj?: any): obj is OpenAPIV3.ReferenceObject {
  return !!obj && obj.hasOwnProperty('$ref');
}

export function NotContainsReferenceObjects<T>(array?: Array<OpenAPIV3.ReferenceObject | T | undefined>): array is T[] {
  return !!array && array.every(item => !IsReferenceObject(item) && !!item);
}

export function IsOpenApiV3(obj?: any): obj is OpenAPIV3.Document {
  return !!obj && obj.hasOwnProperty('openapi') && obj.openapi.match(/^3\./);
}

export function AssertOpenApiV3(obj?: any): asserts obj is OpenAPIV3.Document {

  if (!IsOpenApiV3(obj)) {
    throw new RxapOpenApiError('Only openapi version 3.x.x is supported');
  }

}
