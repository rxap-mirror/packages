import {
  ExecutorContext,
  readJsonFile,
} from '@nx/devkit';
import { join } from 'path';


export function GetWorkspaceName(context: ExecutorContext): string {
  const rootPackageJson = readJsonFile(join(context.root, 'package.json'));
  const name = rootPackageJson.name!;
  const match = name?.match(/@([^/]+)\/(.+)$/);
  if (match) {
    if (match[2] === 'source') {
      return match[1];
    }
    return match[2];
  }
  return name;
}
