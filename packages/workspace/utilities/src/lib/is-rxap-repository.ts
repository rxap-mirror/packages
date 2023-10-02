import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import * as process from 'process';
import { GetPackageJson } from './package-json-file';
import { TreeLike } from './tree';

export function IsRxapRepository(workspaceRootOrTree: string | TreeLike = process.cwd()) {
  let packageJson: any;
  if (typeof workspaceRootOrTree === 'string') {
    const packageJsonFile = join(workspaceRootOrTree, 'package.json');
    if (existsSync(packageJsonFile)) {
      packageJson = JSON.parse(readFileSync(packageJsonFile).toString('utf-8'));
    } else {
      throw new Error(`No package.json found in ${ workspaceRootOrTree }`);
    }
  } else {
    packageJson = GetPackageJson(workspaceRootOrTree);
  }
  return packageJson.repository?.url === 'https://gitlab.com/rxap/packages.git';
}
