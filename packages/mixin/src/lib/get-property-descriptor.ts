export function GetPropertyDescriptor(prototype: any, propertyKey: PropertyKey): PropertyDescriptor | undefined {

  const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyKey);

  if (!descriptor) {
    const parentPrototype = Object.getPrototypeOf(prototype);
    if (parentPrototype !== Object.prototype) {
      return GetPropertyDescriptor(parentPrototype, propertyKey);
    }
  }

  return descriptor;

}
