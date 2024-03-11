import {
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { Ignore } from 'ignore';
import { join } from 'path';

/**
 * Searches for files in a directory recursively.
 *
 * @param {string} directory - The directory path to search in.
 * @param {Ignore|null} gitignore - The gitignore object to check if a file is ignored. Default is null.
 * @yields {Object} - An object containing the file content and file path.
 */
export function* SearchFileInDirectory(directory: string, gitignore: Ignore | null = null): Generator<{ content: string, filePath: string }> {
  const files = readdirSync(directory);

  for (const file of files) {

    if (gitignore && gitignore.ignores(file)) {
      continue; // If the file is in the .gitignore list, skip it
    }

    const filePath = join(directory, file);

    // Check if current path is a directory
    if (statSync(filePath).isDirectory()) {
      yield* SearchFileInDirectory(filePath, gitignore);
    } else {
      const content = readFileSync(filePath, 'utf-8');
      yield { content, filePath };
    }

  }

}
