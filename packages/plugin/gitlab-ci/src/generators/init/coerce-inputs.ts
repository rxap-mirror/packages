export type IncludeComponentInput = Record<string, unknown>;

export function CoerceInputs(current: IncludeComponentInput, addition: IncludeComponentInput) {
  Object.assign(current, addition);
}
