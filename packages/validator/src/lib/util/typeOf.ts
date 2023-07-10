/**
 * Better way to handle type checking
 * null, {}, array and date are objects, which confuses
 */
export function typeOf(input: unknown) {
  const rawObject = Object.prototype.toString.call(input).toLowerCase();
  const typeOfRegex = /\[object (.*)]/g;
  const match = typeOfRegex.exec(rawObject);
  if (!match) {
    throw new Error(`Could not determine type of ${ input }`);
  }
  return match[1];
}
