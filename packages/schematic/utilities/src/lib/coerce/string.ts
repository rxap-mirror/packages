export interface CoerceStringSettings {
  toFixed?: number;
  replacer?: ((this: any, key: string, value: any) => any) | Array<number | string> | null;
  space?: string | number;
}

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
      return 'function'
    case 'symbol':
      return 'symbol';
    case 'bigint':
      return value.toString();
  }
  return '';
}
