export interface AnySchemaObject {
  type: 'any';
}

/**
 * Checks if the provided object conforms to the `AnySchemaObject` interface.
 *
 * This function determines if the given object is an instance of `AnySchemaObject` by checking
 * if the object is not null, has a 'type' property, and if the 'type' property is exactly equal to 'any'.
 *
 * @param obj - The object to be checked.
 * @returns True if the object matches the `AnySchemaObject` interface, false otherwise.
 */
export function IsAnySchemaObject(obj: any): obj is AnySchemaObject {
  return obj && obj['type'] && obj.type === 'any';
}
