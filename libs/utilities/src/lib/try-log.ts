export function TryAndLogOnError<T, A extends any[]>(fnc: (...args: A) => T, defaultResult: T | null = null): (...args: A) => T | null {
  return (...args: A) => {

    let result = defaultResult;

    try {
      result = fnc(...args);
    } catch (e) {
      console.error(e.message, e);
    }

    return result;

  };
}
