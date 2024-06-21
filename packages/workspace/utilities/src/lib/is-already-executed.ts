const alreadyExecuted = new Set<string>();

export function IsAlreadyExecuted(key: string) {
  if (alreadyExecuted.has(key)) {
    return true;
  }
  alreadyExecuted.add(key);
  return false;
}
