import {
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

/**
 * Recursively removes a directory and all its contents.
 *
 * This function synchronously deletes the specified directory along with all its subdirectories and files.
 * It first reads the contents of the directory, then iterates over each item. If the item is a directory,
 * it recursively calls itself to delete that subdirectory; if the item is a file, it deletes the file directly.
 * After all contents are removed, it deletes the empty directory.
 *
 * @param dirPath The path to the directory that should be removed.
 * @throws {Error} Throws if the directory does not exist, or if an error occurs during removal.
 */
export function RemoveDirSync(dirPath: string) {
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      RemoveDirSync(filePath);
    } else {
      unlinkSync(filePath);
    }
  }

  rmdirSync(dirPath);
}
