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
 * @returns {boolean} - Returns `true` if a file exists at either the scoped path or the original path, otherwise returns `false`.
 */
export function ExistsFileWithScope(path: string, scope?: string): boolean {
  return existsSync(InjectScopeInFilePath(path, scope)) || existsSync(path);
}

/**
 * Reads a file from the specified path, optionally modifying the path based on a provided scope.
 * If the file at the modified path does not exist, it attempts to read from the original path.
 *
 * @param {string} path - The original file path from which to read.
 * @param {string} [scope] - Optional scope that may modify the file path.
 * @param {BufferEncoding} [encoding='utf-8'] - The character encoding to use when reading the file. Defaults to 'utf-8'.
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
export function ReadFileWithScope(path: string, scope?: string, encoding: BufferEncoding = 'utf-8'): string {
  let filePath = InjectScopeInFilePath(path, scope);
  if (!existsSync(filePath)) {
    if (!existsSync(path)) {
      throw new Error(`The file "${ path }" does not exists!`);
    }
    filePath = path;
  }
  console.log(`Read file with scope '${scope}': ${ filePath }`);
  return readFileSync(filePath, encoding);
}
