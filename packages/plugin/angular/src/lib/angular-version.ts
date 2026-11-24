import { Tree } from '@nx/devkit';
import { GetRootPackageJson } from '@rxap/workspace-utilities';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * The Angular version used if the workspace has no @angular/core dependency yet
 */
export const ANGULAR_VERSION = '~22.3.0';

function installedAngularCoreVersion(root: string): string | null {
  try {
    // a direct dependency of the workspace is linked into the root node_modules by npm, yarn and pnpm
    return JSON.parse(readFileSync(join(root, 'node_modules', '@angular', 'core', 'package.json'), 'utf-8')).version ?? null;
  } catch {
    return null;
  }
}

/**
 * The Angular version for every @angular/* package a generator adds: the installed @angular/core version, else the
 * @angular/core range of the root package.json, else `ANGULAR_VERSION`.
 *
 * Packages like @angular/localize have an exact peer dependency on @angular/compiler. `AddPackageJsonDependency`
 * pins the lower bound of a range (`~22.2.0` -> `22.2.0`), which conflicts with an installed `22.2.7` compiler
 * (npm ERESOLVE), so the installed version is preferred.
 */
export function GetWorkspaceAngularVersion(tree: Tree): string {
  const rootPackageJson = GetRootPackageJson(tree);
  const range = rootPackageJson.dependencies?.['@angular/core'] ?? rootPackageJson.devDependencies?.['@angular/core'];
  if (range) {
    return installedAngularCoreVersion(tree.root) ?? range;
  }
  return ANGULAR_VERSION;
}
