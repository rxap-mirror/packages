import { Tree } from '@nx/devkit';
import { GetRootPackageJson } from '@rxap/workspace-utilities';

/**
 * The Angular version used if the workspace has no @angular/core dependency yet
 */
export const ANGULAR_VERSION = '~22.3.0';

/**
 * The version range of @angular/core in the root package.json, else `ANGULAR_VERSION`.
 *
 * Use it for every @angular/* package a generator adds: packages like @angular/localize have an exact peer dependency
 * on @angular/compiler, so a different minor version (e.g. ~22.3.0 in a ~22.2.0 workspace) fails the install with
 * npm (ERESOLVE) and pnpm.
 */
export function GetWorkspaceAngularVersion(tree: Tree): string {
  const rootPackageJson = GetRootPackageJson(tree);
  return rootPackageJson.dependencies?.['@angular/core'] ??
         rootPackageJson.devDependencies?.['@angular/core'] ??
         ANGULAR_VERSION;
}
