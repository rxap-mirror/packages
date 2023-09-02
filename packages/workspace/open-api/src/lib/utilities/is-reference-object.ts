import { OpenAPIV3 } from 'openapi-types';

export function IsReferenceObject(obj?: any): obj is OpenAPIV3.ReferenceObject {
  return !!obj && !!obj['$ref'];
}
