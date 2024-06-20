import { hasIndexSignature } from '@rxap/utilities';
import {
  OpenApiSchema,
  OpenApiSchemaFromPath,
} from '../types';

/**
 * Determines if the provided `options` object conforms to the `OpenApiSchemaFromPath` interface.
 *
 * This function checks if the `options` object:
 * 1. Exists and is not null.
 * 2. Contains an index signature, ensuring it can hold properties dynamically.
 * 3. Includes a 'path' property, which is essential for identifying it as an instance of `OpenApiSchemaFromPath`.
 *
 * @param options - The object to be tested against the `OpenApiSchemaFromPath` interface.
 * @returns `true` if `options` matches the `OpenApiSchemaFromPath` interface, otherwise `false`.
 */
export function IsOpenApiSchemaFromPath(options: OpenApiSchema): options is OpenApiSchemaFromPath {
  return !!options && hasIndexSignature(options) && !!options['path'];
}
