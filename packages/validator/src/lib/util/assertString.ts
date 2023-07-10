export function assertString(input: unknown): asserts input is string {
  const isString = typeof input === 'string' || input instanceof String;

  if (!isString) {
    let invalidType: string = typeof input;
    if (input === null) {
      invalidType = 'null';
    } else if (typeof input === 'object' && input !== null) {
      invalidType = input.constructor.name;
    }

    throw new TypeError(`Expected a string but received a ${invalidType}`);
  }
}
