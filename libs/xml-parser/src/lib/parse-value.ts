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
  if (value[ 0 ] === '"' && value[ value.length - 1 ] === '"') {
    return value.substr(1, value.length - 2) as any;
  } else if (value[ 0 ] === '\'' && value[ value.length - 1 ] === '\'') {
    return value.substr(1, value.length - 2) as any;
  } else if ((value[ 0 ] === '[' && value[ value.length - 1 ] === ']') || (value[ 0 ] === '{' && value[ value.length - 1 ] === '}')) {
    try {
      return JSON.parse(value);
    } catch (e) {
    }
  }

  return value as any;
}
