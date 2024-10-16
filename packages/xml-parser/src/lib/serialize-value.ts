/**
 * Serializes a value into a string representation.
 *
 * This function takes a JavaScript value and converts it into a string representation suitable for
 * parsing back using `parseValue`. It handles boolean, null, undefined, numbers, strings, JSON arrays,
 * and JSON objects.
 *
 * @param {any} value - The value to be serialized.
 * @returns {string} - The string representation of the value:
 * - Returns 'true' or 'false' for boolean values.
 * - Returns 'null' for null.
 * - Returns 'undefined' for undefined.
 * - Returns the string representation of a number.
 * - Returns a quoted string for strings.
 * - Returns JSON string for arrays and objects.
 */
export function serializeValue(value: any): string {
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    // Escape double quotes for safety in string representation
    return value.replace(/"/g, '\\"');
  }

  if (Array.isArray(value) || typeof value === 'object') {
    try {
      // Attempt to JSON stringify arrays and plain objects
      return JSON.stringify(value);
    } catch (e: any) {
      console.log('Could not serialize value: ' + e.message, value);
    }
  }

  return String(value);
}
