import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';

/**
 * Reads and parses a JSON file into a TypeScript object.
 *
 * This function synchronously reads a JSON file from the specified path and attempts to parse it into a TypeScript object of generic type T. If the file does not exist or cannot be parsed into JSON, it throws an error.
 *
 * @template T The expected type of the parsed JSON object. Defaults to `Record<string, unknown>` if not specified.
 * @param {string} jsonFilePath The path to the JSON file to be read.
 * @returns {T} The parsed JSON object from the file.
 * @throws {Error} Throws an error if the file does not exist or if the JSON content cannot be parsed.
 */
export function jsonFile<T = Record<string, unknown>>(jsonFilePath: string): T {
  if (!existsSync(jsonFilePath)) {
    throw new Error(`The file ${ jsonFilePath } does not exist`);
  }
  const content = readFileSync(jsonFilePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`Could not parse the file ${ jsonFilePath } to an json object: ${ e.message }`);
  }
}

/**
 * Asynchronously reads and parses a JSON file from the specified path with retry logic.
 *
 * This function attempts to read a JSON file and parse its contents into a TypeScript object of generic type T.
 * If the file does not exist or an error occurs during parsing, the function will retry the operation up to a specified
 * number of times, with an increasing delay between each attempt.
 *
 * @param path - The file system path to the JSON file.
 * @param retries - The maximum number of retry attempts (default is 3).
 * @param sleep - The base delay in milliseconds before retrying after a failure (default is 3000ms).
 * @returns A Promise that resolves to the parsed JSON object of type T.
 *
 * @throws {Error} If the file does not exist or if all retry attempts fail, an error is thrown with an appropriate message.
 *
 * @template T - The expected type of the JSON object to be returned. Defaults to `Record<string, unknown>` if not specified.
 *
 * @example
 *
 * interface User {
 * id: number;
 * name: string;
 * }
 *
 * async function getUserData() {
 * try {
 * const userData: User = await jsonFileWithRetry<User>('./user.json');
 * console.log(userData);
 * } catch (error) {
 * console.error(error);
 * }
 * }
 * ```
 */
export async function jsonFileWithRetry<T = Record<string, unknown>>(path: string, retries = 3, sleep = 3000): Promise<T> {
  if (!existsSync(path)) {
    throw new Error(`Cannot parse json object. File ${ path } not found`);
  }
  let retryCount = 0;
  let lastError: Error | undefined;
  do {
    try {
      return jsonFile<T>(path);
    } catch (e: any) {
      lastError = e;
      retryCount++;
      if (retryCount < retries) {
        await new Promise(resolve => setTimeout(resolve, sleep * retryCount));
      }
    }
  } while (retryCount < retries);
  throw new Error(`Failed to parse json file ${ path }: ${ lastError?.message }`);
}

/**
 * Writes a JSON object to a file with a specified path.
 *
 * This function takes a generic type `T` representing the structure of the data to be written.
 * The data is converted to a JSON string with a pretty-print format (2 spaces indentation),
 * and it ensures the JSON file ends with a newline character for better readability.
 *
 * @param jsonFilePath The path where the JSON file will be saved.
 * @param data The data to be written to the file. This can be any type that can be serialized into JSON.
 * @template T The type of the data being written to the JSON file.
 */
export function writeJsonFile<T>(jsonFilePath: string, data: T) {
  writeFileSync(jsonFilePath, JSON.stringify(data, null, 2) + '\n');
}
