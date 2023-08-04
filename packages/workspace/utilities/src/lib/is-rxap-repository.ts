import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import * as process from 'process';

export function IsRxapRepository(workspaceRoot = process.cwd()) {
  const packageJsonFile = join(workspaceRoot, 'package.json');
  if (existsSync(packageJsonFile)) {
    const packageJson = JSON.parse(readFileSync(packageJsonFile).toString('utf-8'));
    return packageJson.name === 'rxap';
  }
  throw new Error(`No package.json found in ${ workspaceRoot }`);
}
