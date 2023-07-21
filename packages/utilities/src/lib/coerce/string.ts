export interface CoerceStringSettings {
  toFixed?: number;
  replacer?: ((this: any, key: string, value: any) => any) | Array<number | string> | null;
  space?: string | number;
}

/**
 * This function coerces any given value into a string representation based on its type.
 *
 * @export
 * @function coerceString
 * @param {any} value - The value to be coerced into a string. This can be of any type.
 * @param {CoerceStringSettings} [settings={}] - An optional settings object to customize the coercion process.
 * The settings object can have the following properties:
 * - replacer: A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. This is used when the value is an object.
 * - space: A String or Number object that's used to insert white space into the output JSON string for readability purposes. This is used when the value is an object.
 * - toFixed: A number indicating how many digits to appear after the decimal point when the value is a number.
 *
 * @returns {string} - The string representation of the input value. The conversion is done as follows:
 * - If the value is undefined, it returns 'undefined'.
 * - If the value is an object, it returns a JSON string representation of the object. The stringification process can be customized using the replacer and space properties of the settings object.
 * - If the value is a boolean, it returns 'true' if the boolean is true, and 'false' if the boolean is false.
 * - If the value is a number, it returns the string representation of the number with the number of digits after the decimal point specified by the toFixed property of the settings object.
 * - If the value is a string, it returns the string itself.
 * - If the value is a function, it returns 'function'.
 * - If the value is a symbol, it returns 'symbol'.
 * - If the value is a bigint, it returns the string representation of the bigint.
 * - If the value is of any other type, it returns an empty string.
 */
export function coerceString(value: any, settings: CoerceStringSettings = {}): string {
  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'object':
      return JSON.stringify(value, settings.replacer as any, settings.space);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return value.toFixed(settings.toFixed);
    case 'string':
      return value;
    case 'function':
      return 'function';
    case 'symbol':
      return 'symbol';
    case 'bigint':
      return value + '';
  }
  return '';
}
