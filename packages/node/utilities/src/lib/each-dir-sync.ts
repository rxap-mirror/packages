import { readdirSync } from 'fs';
import { join } from 'path';

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
