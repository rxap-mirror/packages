import {
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { GetBuildOutputForProject } from '@rxap/generator-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { GetWorkspaceScope } from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';

export function updateProjectPackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  projectName: string,
  rootPackageJson: ProjectPackageJson,
) {
  const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
  const scope = GetWorkspaceScope(tree);
  packageJson.scripts ??= {};
  if (Object.keys(packageJson.scripts).length === 0) {
    delete packageJson.scripts;
  }
  if (packageJson.name && !packageJson.name.startsWith('@')) {
    const newName = `${ scope }/${ projectName }`;
    updatePathsAliasInBaseTsConfig(tree, project, packageJson.name, newName);
    packageJson.name = newName;
  }
  packageJson.publishConfig ??= {};
  packageJson.publishConfig.access = 'public';
  const output = GetBuildOutputForProject(project);
  packageJson.publishConfig.directory = relative(project.root, output);

  // add common properties
  packageJson.keywords = [
    ...new Set([
      ...(
        packageJson.keywords ?? []
      ),
      ...(
        rootPackageJson.keywords ?? []
      ),
      ...(
        project.tags ?? []
      ),
      projectName,
    ]),
  ];
  if (rootPackageJson.homepage) {
    packageJson.homepage = join(rootPackageJson.homepage, project.root);
  }
  packageJson.bugs = rootPackageJson.bugs;
  packageJson.license = rootPackageJson.license;
  packageJson.contributors = rootPackageJson.contributors;
  packageJson.funding = rootPackageJson.funding;
  packageJson.repository = rootPackageJson.repository;
  if (packageJson.repository && typeof packageJson.repository === 'object') {
    packageJson.repository.directory = project.root;
  }
  packageJson.author = rootPackageJson.author;
  writeJson(tree, join(project.root, 'package.json'), packageJson);
}

function updatePathsAliasInBaseTsConfig(
  tree: Tree,
  project: ProjectConfiguration,
  currentPackageJsonName: string,
  newPackageJsonName: string,
) {
  const tsConfig = readJson(tree, join('/', 'tsconfig.base.json'));
  if (tsConfig.compilerOptions.paths[currentPackageJsonName]) {
    const aliasList = tsConfig.compilerOptions.paths[currentPackageJsonName];
    delete tsConfig.compilerOptions.paths[currentPackageJsonName];
    tsConfig.compilerOptions.paths[newPackageJsonName] = aliasList;
  }
  writeJson(tree, join('/', 'tsconfig.base.json'), tsConfig);
}
