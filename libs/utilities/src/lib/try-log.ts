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

export function TryAndLogOnErrorAsync<T, A extends any[]>(
  fnc: (...args: A) => T | Promise<T>,
  defaultResult: T | null = null
): (...args: A) => Promise<T | null> {
  return async (...args: A) => {

    let result = defaultResult;

    try {
      result = await fnc(...args);
    } catch (e) {
      console.error(e.message, e);
    }

    return result;

  };
}
