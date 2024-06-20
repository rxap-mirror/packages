import { OpenAPIV3 } from 'openapi-types';

/**
 * Checks if the provided object is a ReferenceObject as defined in the OpenAPI V3 specification.
 *
 * A ReferenceObject in the OpenAPI specification is an object that contains a `$ref` property.
 * This function determines if the given object has a `$ref` property, which would indicate that
 * it conforms to the ReferenceObject structure.
 *
 * @param {any} obj - The object to check. This parameter is optional.
 * @returns {boolean} - Returns `true` if the object is a ReferenceObject, otherwise returns `false`.
 *
 * @example
 * // returns true
 * IsReferenceObject({ '$ref': '#/components/schemas/Example' });
 *
 * @example
 * // returns false
 * IsReferenceObject({ 'name': 'Example' });
 *
 * @example
 * // returns false
 * IsReferenceObject();
 */
export function IsReferenceObject(obj?: any): obj is OpenAPIV3.ReferenceObject {
  return !!obj && !!obj['$ref'];
}
