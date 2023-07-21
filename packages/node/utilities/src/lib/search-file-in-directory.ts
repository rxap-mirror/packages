import {
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { join } from 'path';
import { Ignore } from 'ignore';

export function* SearchFileInDirectory(directory: string, gitignore: Ignore | null = null): Generator<any> {
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
