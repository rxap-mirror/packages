import { hasIndexSignature } from '@rxap/utilities';
import {
  OpenApiSchema,
  OpenApiSchemaFromPath,
} from '../types';

export function IsOpenApiSchemaFromPath(options: OpenApiSchema): options is OpenApiSchemaFromPath {
  return !!options && hasIndexSignature(options) && !!options['path'];
}
