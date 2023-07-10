export function GetAllPropertyNames(prototype: any): string[] {

  const names = Object.getOwnPropertyNames(prototype);

  const parentPrototype = Object.getPrototypeOf(prototype);

  if (parentPrototype) {
    if (parentPrototype !== Object.prototype) {
      names.push(...GetAllPropertyNames(parentPrototype));
    }
  }

  return names.filter((name, index, self) => self.indexOf(name) === index);

}
