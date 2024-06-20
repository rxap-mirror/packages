import { join } from 'path';
import {
  existsSync,
  readFileSync,
} from 'fs';
import ignore from 'ignore';

/**
 * Retrieves the ignore patterns defined in a `.gitignore` file located within a specified directory.
 *
 * This function searches for a `.gitignore` file in the provided directory path. If the file exists,
 * it reads the file's content and returns an `ignore` object populated with the ignore patterns.
 * If the `.gitignore` file does not exist in the specified directory, the function returns `null`.
 *
 * @param {string} [directory=''] - The directory path where the `.gitignore` file is located. If no directory is specified, the current directory is used.
 * @returns {Ignore | null} An `ignore` object containing the patterns from the `.gitignore` file if it exists, otherwise `null`.
 *
 * @example
 * // Assuming there is a `.gitignore` file in the current directory with ignore patterns.
 * const ignorePatterns = GetGitIgnorePatterns();
 * if (ignorePatterns) {
 * console.log("Ignore patterns loaded.");
 * } else {
 * console.log("No .gitignore file found.");
 * }
 */
export function GetGitIgnorePatterns(directory = '') {
  const gitignorePath = join(directory, '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    return ignore().add(gitignoreContent);
  } else {
    return null;
  }
}
