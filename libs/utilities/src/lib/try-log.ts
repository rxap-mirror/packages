export function TryAndLogOnError<T>(fnc: () => T, defaultResult: T | null = null): T | null {
  let result = defaultResult;

  try {
    result = fnc();
  } catch (e) {
    console.error(e.message, e);
  }

  return result;
}
