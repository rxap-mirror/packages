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
  const name = rootPackageJson.name;
  const match = name?.match(/@([^/]+)\/(.+)$/);
  if (match) {
    if (match[2] === 'source') {
      return match[1];
    }
    return match[2];
  }
  return 'unknown';
}

export function updateTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'docker', 'build');
  CoerceTargetDefaultsDependency(nxJson, 'deploy', 'build');
  CoerceTargetDefaultsDependency(nxJson, 'docker-save', 'docker');

  CoerceTargetDefaults(nxJson, 'docker-save', {
    executor: '@rxap/plugin-docker:save',
  });
  CoerceTargetDefaults(nxJson, 'docker', {
    executor: '@rxap/plugin-docker:build',
    options: {
      imageRegistry: process.env.REGISTRY ?? 'registry.gitlab.com',
      imageName: process.env.IMAGE_NAME ?? guessImageName(tree),
    },
  }, Strategy.MERGE);

  CoerceNxJsonCacheableOperation(nxJson, 'docker');
  CoerceNxJsonCacheableOperation(nxJson, 'deploy');

  updateNxJson(tree, nxJson);
}
