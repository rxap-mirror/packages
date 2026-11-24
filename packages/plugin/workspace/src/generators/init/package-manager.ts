import { Tree } from '@nx/devkit';
import {
  GetPackageManagerProfile,
  PackageManagerProfile,
  PackageManagerSubstitutions,
  ResolvedPackageManager,
  ResolvePackageManager,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export interface WorkspacePackageManager {
  resolved: ResolvedPackageManager;
  profile: PackageManagerProfile;
  substitutions: Record<string, string>;
}

/**
 * The package manager of the workspace: the `packageManager` option, else the one the workspace already uses.
 */
export function resolveWorkspacePackageManager(tree: Tree, options: Pick<InitGeneratorSchema, 'packageManager'>): WorkspacePackageManager {
  const resolved = ResolvePackageManager(tree, options.packageManager);
  const profile = GetPackageManagerProfile(resolved, tree);
  return {
    resolved,
    profile,
    substitutions: PackageManagerSubstitutions(profile),
  };
}
