export interface RefSchemaObject {
  $ref: string;
}

/**
 * Checks if the given object is a reference schema object.
 *
 * A reference schema object is typically used in JSON schema and OpenAPI specifications
 * to reuse definitions. This function determines if the provided object contains a `$ref` property,
 * which is a common indicator of a reference schema object.
 *
 * @param obj - The object to check.
 * @returns True if `obj` contains a `$ref` property, indicating it is a reference schema object; otherwise, false.
 *
 * @example
 *
 * const schema = { $ref: '#/definitions/example' };
 * console.log(IsRefSchemaObject(schema)); // Output: true
 * ```
 */
export function IsRefSchemaObject(obj: any): obj is RefSchemaObject {
  return obj && obj['$ref'];
}

export interface ArrayRefSchemaObject {
  type: 'array';
  items: RefSchemaObject;
}

/**
 * Checks if a given object conforms to the `ArrayRefSchemaObject` type.
 *
 * This function determines if the provided object is an `ArrayRefSchemaObject` by checking specific properties:
 * - The object must exist and have a `type` property equal to 'array'.
 * - The `items` property of the object must satisfy the `IsRefSchemaObject` check.
 *
 * @param obj - The object to be checked.
 * @returns True if the object matches the `ArrayRefSchemaObject` type criteria, false otherwise.
 */
export function IsArrayRefSchemaObject(obj: any): obj is ArrayRefSchemaObject {
  return obj && obj.type === 'array' && IsRefSchemaObject(obj.items);
}
