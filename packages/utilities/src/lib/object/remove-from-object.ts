export function RemoveFromObject(obj: any, path: string) {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return;
  }

  if (obj && typeof obj === 'object') {
    const fragment: string = fragments.shift()!;

    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(fragment)) {

      if (fragments.length === 0) {
        if (obj[fragment] !== undefined) {
          delete obj[fragment];
        }
      } else {
        RemoveFromObject(obj[fragment], fragments.join('.'));
      }

    }

  }

}
