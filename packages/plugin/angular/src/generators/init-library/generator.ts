import {
  getProjects,
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import {
  Assets,
  CoerceAssets,
  CoerceFile,
  RemoveAssets,
  SkipNonLibraryProject,
} from '@rxap/generator-utilities';
import {
  join,
  relative,
} from 'path';
import { SkipNonAngularProject } from '../../lib/skip-project';
import { InitGeneratorSchema } from '../init/schema';
import { InitLibraryGeneratorSchema } from './schema';

function hasIndexScss(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.sourceRoot, '_index.scss'));
}

interface NgPackageJson {
  assets: Assets;
}

function readNgPackageJson(tree: Tree, project: ProjectConfiguration): NgPackageJson {
  if (!tree.exists(join(project.root, 'ng-package.json'))) {
    throw new Error(`The project ${ project.name } has no ng-package.json file.`);
  }
  return readJson(tree, join(project.root, 'ng-package.json'));
}

function writeNgPackageJson(tree: Tree, project: ProjectConfiguration, ngPackageJson: NgPackageJson) {
  writeJson(tree, join(project.root, 'ng-package.json'), ngPackageJson);
}

function updateProjectNgPackageConfiguration(tree: Tree, project: ProjectConfiguration) {
  const ngPackageJson = readNgPackageJson(tree, project);

  ngPackageJson.assets ??= [];

  CoerceAssets(ngPackageJson.assets, [ 'README.md', 'CHANGELOG.md', 'LICENSE' ]);

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

  if (hasIndexScss(tree, project)) {
    CoerceAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  } else {
    RemoveAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  }

  writeNgPackageJson(tree, project, ngPackageJson);
}


function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function extendAngularSpecificEslint(tree: Tree, project: ProjectConfiguration) {
  const projectRoot = project.root;

  const relativeToAngularRoot = relative(projectRoot, 'packages/angular');

  console.log('relativeToAngularRoot', relativeToAngularRoot);

  const extendsPath = relativeToAngularRoot + '/.eslintrc.json';

  const eslintConfigFilaPath = `${ projectRoot }/.eslintrc.json`;
  const defaultEslintConfig = {
    extends: [ extendsPath ],
    ignorePatterns: [ '!**/*' ],
    overrides: [],
  };
  CoerceFile(tree, eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));

  const eslintConfig = JSON.parse(tree.read(eslintConfigFilaPath).toString('utf-8'));

  if (eslintConfig.extends[0] !== extendsPath) {
    tree.write(eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));
  }

}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  console.log('angular library init generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectNgPackageConfiguration(tree, project);
    extendAngularSpecificEslint(tree, project);

  }

}

export default initLibraryGenerator;
