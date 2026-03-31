import {
  OpenAPIV3,
} from 'openapi-types';
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

export function hasJsonContentSchema<T extends OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject>(
  data: T | undefined | OpenAPIV3.ReferenceObject
): data is T & { content: Record<string, OpenAPIV3.MediaTypeObject> } {
  return !!data && !IsReferenceObject(data) && 'content' in data && !!data.content && hasJsonSchema(data.content);
}

export function getJsonContentSchema(
  data: OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject
): OpenAPIV3.SchemaObject | null {
  if (hasJsonContentSchema(data)) {
    return getJsonSchema(data.content);
  }
  return null;
}

export function hasJsonSchema(map: Record<string, OpenAPIV3.MediaTypeObject> | undefined) {
  return !!map && Object.keys(map).some(key => key.match(/^application\/(.+\+)?json/));
}

export function getJsonSchema(map: Record<string, OpenAPIV3.MediaTypeObject>) {
  if (!hasJsonSchema(map)) {
    return null;
  }
  let schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | null | undefined;
  if ('application/json' in map) {
    schema = map['application/json'].schema;
  } else {
    schema = Object.entries(map).find(([ key ]) => key.match(/^application\/(.+\+)?json/))?.[1]?.schema;
  }
  if (!schema) {
    return null;
  }
  if (IsReferenceObject(schema)) {
    return null;
  }
  return schema;
}
