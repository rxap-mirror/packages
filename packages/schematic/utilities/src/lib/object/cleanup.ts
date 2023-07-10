// eslint-disable-next-line @typescript-eslint/ban-types
export function DeleteUndefinedProperties<T extends {}>(obj: T): Exclude<T, undefined> {
  const keys = Object.keys(obj);
  const cloneObj: any = {};

  for (const key of keys) {
    if ((obj as any)[key] !== undefined) {
      cloneObj[key] = (obj as any)[key];
    }
  }

  return cloneObj;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function DeleteNullProperties<T extends {}>(obj: T): Exclude<T, null> {
  const keys = Object.keys(obj);
  const cloneObj: any = {};

  for (const key of keys) {
    if ((obj as any)[key] !== null) {
      cloneObj[key] = (obj as any)[key];
    }
  }

  return cloneObj;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function DeleteEmptyProperties<T extends {}>(obj: T): Exclude<Exclude<T, null>, undefined> {
  return DeleteUndefinedProperties(DeleteNullProperties(obj));
}
