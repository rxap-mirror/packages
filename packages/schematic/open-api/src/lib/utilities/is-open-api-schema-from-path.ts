import {
  OpenApiSchema,
  OpenApiSchemaFromPath,
} from '../types';
import { hasIndexSignature } from '@rxap/utilities';

export function IsOpenApiSchemaFromPath(options: OpenApiSchema): options is OpenApiSchemaFromPath {
  return !!options && hasIndexSignature(options) && !!options['path'];
}
