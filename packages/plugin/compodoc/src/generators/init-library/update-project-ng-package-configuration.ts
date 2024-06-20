import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  ReadNgPackageJson,
  WriteNgPackageJson,
} from '@rxap/workspace-utilities';

export function updateProjectNgPackageConfiguration(tree: Tree, project: ProjectConfiguration) {
  const ngPackageJson = ReadNgPackageJson(tree, project);

  ngPackageJson.assets ??= [];

  CoerceAssets(ngPackageJson.assets, [ 'compodoc' ]);

  WriteNgPackageJson(tree, project, ngPackageJson);
}
