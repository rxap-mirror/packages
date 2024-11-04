import { dasherize } from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';

/**
 * Modifies a file path by injecting a scope into its name, just before the file extension.
 * If the file path does not have an extension, the scope is appended at the end with a dot separator.
 *
 * @param {string} filePath - The original file path to be modified.
 * @param {string} [scope] - The scope to be injected into the file path. If not provided, the original file path is returned unchanged.
 * @returns {string} The modified file path with the scope injected. If no scope is provided, returns the original file path.
 */
export function InjectScopeInFilePath(filePath: string, scope?: string): string {
  scope = scope ? dasherize(scope) : scope;
  if (!scope) {
    return filePath;
  }

  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${ filePath }.${ scope }`;
  }

  return `${ filePath.substring(0, lastDotIndex) }.${ scope }${ filePath.substring(lastDotIndex) }`;
}

/**
 * Checks if a file exists at the specified path or a modified path including a scope.
 *
 * This function first modifies the provided file path by injecting a scope (if provided) and checks if the file exists at this new path.
 * If the file does not exist at the scoped path, it checks the original path.
 *
 * @param path - The original file path to check for existence.
 * @param scope - Optional. A string representing the scope to be injected into the file path.
 * @param production - Optional. A boolean indicating whether the application is running in production mode.
 * @returns {boolean} - Returns `true` if a file exists at either the scoped path or the original path, otherwise returns `false`.
 */
export function ExistsFileWithScope(path: string, scope?: string, production?: boolean): boolean {
  scope = scope ? dasherize(scope) : scope;
  if (existsSync(InjectScopeInFilePath(path, scope))) {
    return true;
  }
  if (production && existsSync(InjectScopeInFilePath(path, 'production'))) {
    return true;
  }
  return existsSync(path);
}

/**
 * Reads a file from the specified path, optionally modifying the path based on a provided scope.
 * If the file at the modified path does not exist, it attempts to read from the original path.
 *
 * @param {string} path - The original file path from which to read.
 * @param {string} [scope] - Optional scope that may modify the file path.
 * @param production - Optional. A boolean indicating whether the application is running in production mode.
 * @param {BufferEncoding} [encoding='utf-8'] - The character encoding to use when reading the file. Defaults to 'utf-8'.
 * @param {Logger} [logger=console] - Optional. A logger object with a `log` method to log messages. Defaults to `console`.
 * @returns {string} The content of the file read as a string.
 * @throws {Error} Throws an error if neither the scoped nor the original file paths exist.
 *
 * @example
 * // Reads a file from 'path/to/file.txt' with a scope 'test', using default UTF-8 encoding.
 * const content = ReadFileWithScope('path/to/file.txt', 'test');
 *
 * @example
 * // Reads a file from 'path/to/file.txt' without a scope, using 'ascii' encoding.
 * const content = ReadFileWithScope('path/to/file.txt', undefined, 'ascii');
 */
export function ReadFileWithScope(path: string, scope?: string, production?: boolean, encoding: BufferEncoding = 'utf-8', logger: { log: (msg: string, ...args: any[]) => void } = console): string {
  scope = scope ? dasherize(scope) : scope;
  let filePath = InjectScopeInFilePath(path, scope);
  if (!existsSync(filePath)) {
    if (production) {
      filePath = InjectScopeInFilePath(path, 'production');
    } else {
      filePath = path;
    }
    if (!existsSync(path)) {
      throw new Error(`The file "${ path }" does not exists!`);
    }
  }
  logger.log(`Read file with scope '${scope}' (production=${production}): ${ filePath }`);
  return readFileSync(filePath, encoding);
}
