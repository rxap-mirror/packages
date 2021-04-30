import {
  OpenApiSchema,
  OpenApiSchemaFromPath
} from '../types';

export function IsOpenApiSchemaFromPath(options: OpenApiSchema): options is OpenApiSchemaFromPath {
  return options && options.hasOwnProperty('path');
}
