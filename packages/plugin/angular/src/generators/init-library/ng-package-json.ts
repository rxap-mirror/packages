import {
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { Assets } from '@rxap/workspace-utilities';
import { join } from 'path';

interface NgPackageJson {
  assets: Assets;
}

export function readNgPackageJson(tree: Tree, project: ProjectConfiguration): NgPackageJson {
  if (!tree.exists(join(project.root, 'ng-package.json'))) {
    throw new Error(`The project ${ project.name } has no ng-package.json file.`);
  }
  return readJson(tree, join(project.root, 'ng-package.json'));
}

export function writeNgPackageJson(tree: Tree, project: ProjectConfiguration, ngPackageJson: NgPackageJson) {
  writeJson(tree, join(project.root, 'ng-package.json'), ngPackageJson);
}
