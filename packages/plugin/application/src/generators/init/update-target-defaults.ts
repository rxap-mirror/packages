import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTargetDefaults,
  CoerceTargetDefaultsDependency,
  GetPackageJson,
  GetWorkspaceName,
  Strategy,
} from '@rxap/workspace-utilities';
import process from 'process';

function guessImageName(tree: Tree) {
  const rootPackageJson = GetPackageJson(tree);
  if (rootPackageJson.repository) {
    const repo = typeof rootPackageJson.repository === 'string' ?
                 rootPackageJson.repository :
                 rootPackageJson.repository.url;
    if (repo) {
      const match = repo.match(/https:\/\/([^/]+)\/(.+)\.git$/);
      if (match) {
        if (match[1] === 'gitlab.com') {
          return match[2];
        }
      }
    }
  }
  return GetWorkspaceName(tree);
}

export function updateTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaults(nxJson, '@rxap/plugin-docker:build', {
    options: {
      imageRegistry: process.env.REGISTRY ?? 'registry.gitlab.com',
      imageName: process.env.IMAGE_NAME ?? guessImageName(tree),
    },
  }, Strategy.MERGE);

  updateNxJson(tree, nxJson);
}
