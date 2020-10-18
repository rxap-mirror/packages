export function coerceBoolean(value: any): boolean {
  return value !== undefined && value !== null && value !== false;
}
