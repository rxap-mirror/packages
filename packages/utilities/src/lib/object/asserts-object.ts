export function assertsObject(value: any): asserts value is object {
  if (typeof value !== 'object') {
    throw new Error('The value must be an object');
  }
}
