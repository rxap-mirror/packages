import {
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

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
