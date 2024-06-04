import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { relative } from 'path';

export function extendAngularSpecificEslint(tree: Tree, project: ProjectConfiguration) {

  if (!IsRxapRepository(tree)) {
    return;
  }

  const projectRoot = project.root;

  const relativeToAngularRoot = relative(projectRoot, 'packages/angular');

  const extendsPath = relativeToAngularRoot + '/.eslintrc.json';

  const eslintConfigFilaPath = `${ projectRoot }/.eslintrc.json`;
  const defaultEslintConfig = {
    extends: [ extendsPath ],
    ignorePatterns: [ '!**/*' ],
    overrides: [],
  };
  CoerceFile(tree, eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));

  const eslintConfig = JSON.parse(tree.read(eslintConfigFilaPath)!.toString('utf-8'));

  if (eslintConfig.extends[0] !== extendsPath) {
    tree.write(eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));
  }

}
