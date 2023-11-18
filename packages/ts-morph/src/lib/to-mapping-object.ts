import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export interface ToMappingObjectOptions {
  baseProperty?: string;
  aliasFnc?: (key: string, value: string) => string;
}

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
