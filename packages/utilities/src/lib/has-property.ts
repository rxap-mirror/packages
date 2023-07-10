export function hasProperty<T>(obj: T, propertyKey: PropertyKey, value?: any): propertyKey is keyof T {

  function hasPropertyDeep(obj: any, propertyKey: PropertyKey, value?: any): boolean {
    if (typeof propertyKey === 'string') {

      const fragments = propertyKey.split('.');

      const pk = fragments.pop()!;

      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(pk)) {
        const _obj = obj[pk];
        if (fragments.length) {
          return hasPropertyDeep(_obj, fragments.join('.'));
        } else {
          return value === undefined || _obj === value;
        }
      }

      return false;

    } else {
      // eslint-disable-next-line no-prototype-builtins
      return obj.hasOwnProperty(propertyKey);
    }
  }

  return obj !== null && obj !== undefined && typeof obj === 'object' && hasPropertyDeep(obj, propertyKey);
}
