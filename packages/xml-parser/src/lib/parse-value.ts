/**
 * Parses a string and converts it into a specified type `T`.
 *
 * This function intelligently converts a string representation of various data types into its corresponding
 * JavaScript type. It handles boolean, null, undefined, numbers, strings, JSON arrays, and JSON objects.
 *
 * @param {string} value - The string to be parsed.
 * @returns {T} - The parsed value converted into type `T`. The specific type depends on the content of the input string:
 * - Returns a boolean if the input is 'true' or 'false'.
 * - Returns `null` if the input is 'null'.
 * - Returns `undefined` if the input is 'undefined'.
 * - Returns a number if the input is a valid number.
 * - Returns a string if the input is enclosed in double quotes ("") or single quotes ('').
 * - Attempts to return a parsed JSON object or array if the input is a valid JSON string enclosed in curly braces ({})
 * or square brackets ([]).
 * - Returns the original string for all other cases.
 *
 * Note: If JSON parsing fails, it logs an error message and returns the input as a string.
 */
export function parseValue<T>(value: string): T {
  if (value === 'true' || value === 'false') {
    return (value === 'true') as any;
  }

  if (value === 'null') {
    return null as any;
  }

  if (value === 'undefined') {
    return undefined as any;
  }

  if (value === '') {
    return value as any;
  }
  if (!isNaN(Number(value))) {
    return Number(value) as any;
  }

  // test if string
  if (value[0] === '"' && value[value.length - 1] === '"') {
    return value.substr(1, value.length - 2) as any;
  } else if (value[0] === '\'' && value[value.length - 1] === '\'') {
    return value.substr(1, value.length - 2) as any;
  } else if ((value[0] === '[' && value[value.length - 1] === ']') ||
    (value[0] === '{' && value[value.length - 1] === '}')) {
    try {
      return JSON.parse(value);
    } catch (e: any) {
      console.log('Could not parse value: ' + e.message, value);
    }
  }

  return value as any;
}
