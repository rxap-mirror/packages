export function IsFunction<ReturnType, ArgumentTypes extends any[]>(value: any): value is ((...args: ArgumentTypes) => ReturnType) {
  return typeof value === 'function';
}
