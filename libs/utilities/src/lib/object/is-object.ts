export function IsObject(obj: any): obj is object {
  return obj && typeof obj === 'object';
}

export function IsRecord(obj: any): obj is Record<any, any> {
  return IsObject(obj) && Object.keys(obj).length !== 0;
}

export function AssertObject(obj: any): asserts obj is object {
  if (!IsObject(obj)) {
    throw new Error(`The value is not a object instead: '${!obj ? obj : typeof obj}'`);
  }
}

export function AssertRecord(obj: any): asserts obj is Record<any, any> {
  if (!IsRecord(obj)) {
    throw new Error(`The value is not a record instead: '${!obj ? obj : Object.keys(obj).length === 0 ? 'without any key' : typeof obj}'`);
  }
}

