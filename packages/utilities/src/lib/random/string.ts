/**
 * Generates a random alphanumeric string of a specified length.
 *
 * @export
 * @function GenerateRandomString
 * @param {number} [length=32] - The length of the string to be generated. If no value is provided, the default length is 32.
 *
 * The function works by initializing an empty string and a string of possible characters. It then loops for the specified length,
 * each time selecting a random character from the possible characters string and appending it to the result string.
 *
 * @returns {string} The generated random alphanumeric string.
 *
 * @example
 * // returns a random alphanumeric string of length 32
 * GenerateRandomString();
 *
 * @example
 * // returns a random alphanumeric string of length 10
 * GenerateRandomString(10);
 */
export function GenerateRandomString(length = 32) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
