import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  RemoveAssets,
} from '@rxap/workspace-utilities';
import { hasIndexScss } from './has-index-scss';
import { hasTailwindConfig } from './has-tailwind-config';
import {
  readNgPackageJson,
  writeNgPackageJson,
} from './ng-package-json';

export function updateProjectNgPackageConfiguration(tree: Tree, project: ProjectConfiguration) {
  const ngPackageJson = readNgPackageJson(tree, project);

  ngPackageJson.assets ??= [];

  CoerceAssets(ngPackageJson.assets, [ 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE.md' ]);

  const assetThemes = {
    input: '.',
    glob: '**/*.theme.scss',
    output: '.',
  };
  const assetIndex = {
    input: '.',
    glob: '_index.scss',
    output: '.',
  };

  const assetStyles = 'theme.css';

  if (hasIndexScss(tree, project)) {
    CoerceAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  } else {
    RemoveAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  }

  if (hasTailwindConfig(tree, project)) {
    CoerceAssets(ngPackageJson.assets, [ assetStyles ]);
  } else {
    RemoveAssets(ngPackageJson.assets, [ assetStyles ]);
  }

  writeNgPackageJson(tree, project, ngPackageJson);
}
