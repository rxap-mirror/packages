import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export interface ToMappingObjectOptions {
  /**
   * The base property name to prefix mapped values with (e.g. 'input').
   */
  baseProperty?: string;
  /**
   * A function to transform or alias specific keys/values during mapping.
   */
  aliasFnc?: (key: string, value: string) => string;
}

/**
 * Converts a JavaScript object to a ts-morph WriterFunction that writes an object literal.
 * Useful for generating mapping objects or configuration objects in code.
 *
 * @param input - The input object to convert.
 * @param options - Options for the conversion (base property, alias function).
 * @returns A WriterFunction that writes the object literal.
 */
export function ToMappingObject(input: Record<string, any>, options: ToMappingObjectOptions = {}): WriterFunction {
  const {
    baseProperty,
    aliasFnc,
  } = options;
  const mapping: Record<string, string | WriterFunction> = {};
  for (const [ key, value ] of Object.entries(input)) {
    if (typeof value === 'object') {
      mapping[key.includes('-') ? `"${ key }"` : key] = ToMappingObject(value, options);
    } else if (typeof value === 'string') {
      let accessKey = value;
      if (aliasFnc) {
        accessKey = aliasFnc(key, value);
      }
      if (baseProperty) {
        accessKey = `${ baseProperty }.${ accessKey }`;
      }
      mapping[key.includes('-') ? `"${ key }"` : key] = accessKey;
    } else {
      throw new Error(`Invalid value type ${ typeof value }`);
    }
  }
  return Writers.object(mapping);
}
