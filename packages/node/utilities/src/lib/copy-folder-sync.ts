import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { join } from 'path';

/**
 * Recursively copies a folder and all its contents from a source path to a destination path.
 *
 * This function synchronously copies a directory from the specified source path to the destination path.
 * If the destination directory does not exist, it is created. The function then reads the contents of the
 * source directory, and for each entry, it checks if it's a directory or a file. If it's a directory,
 * the function is called recursively to copy its contents. If it's a file, the file is directly copied.
 * This process ensures that the entire directory tree structure from the source is replicated at the destination.
 *
 * @param src The source path of the folder to be copied.
 * @param dest The destination path where the folder should be copied.
 * @throws {Error} Throws an error if the source path does not exist or if there are issues in accessing the source or destination.
 */
export function CopyFolderSync(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest);
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      CopyFolderSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
