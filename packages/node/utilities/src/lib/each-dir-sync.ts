import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Recursively generates paths for all files within a specified directory and its subdirectories.
 *
 * This generator function traverses the given directory, yielding the path for each file it encounters.
 * If a directory is found within the current directory, the function recursively yields all file paths
 * from the subdirectory before continuing with the next file or directory.
 *
 * @param dir The root directory from which file and directory paths will be generated.
 * @returns A Generator that yields the path of each file found within the specified directory and its subdirectories.
 *
 * @example
 * // Usage example:
 * for (const filePath of EachDirSync('/path/to/directory')) {
 * console.log(filePath);
 * }
 */
export function* EachDirSync(dir: string): Generator<string> {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* EachDirSync(join(dir, file.name));
    } else {
      yield join(dir, file.name);
    }
  }
}
