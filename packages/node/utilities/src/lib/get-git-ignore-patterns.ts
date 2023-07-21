import { join } from 'path';
import {
  existsSync,
  readFileSync,
} from 'fs';
import ignore from 'ignore';

export function GetGitIgnorePatterns(directory = '') {
  const gitignorePath = join(directory, '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    return ignore().add(gitignoreContent);
  } else {
    return null;
  }
}
