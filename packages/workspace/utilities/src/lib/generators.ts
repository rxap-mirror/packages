import { ProjectConfiguration } from '@nx/devkit';
import { join } from 'path';
import { CoerceFile } from './coerce-file';
import { GetProject } from './get-project';
import { PackageJson } from './package-json';
import { GetPackageJson } from './package-json-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export interface PackageJsonWithGenerators extends PackageJson {
  generators: string;
}

export function HasGeneratorProperty(packageJson: PackageJson): packageJson is PackageJsonWithGenerators {
  return !!packageJson['generators'] || !!packageJson['schematics'];
}

export function GetGeneratorFilePath(projectRoot: string, packageJson: PackageJsonWithGenerators): string {

  if (!packageJson['generators'] && !packageJson['schematics']) {
    throw new Error(`The package.json of the project ${ projectRoot } does not contains a generators property!`);
  }

  return join(projectRoot, packageJson['generators'] ?? packageJson['schematics']);

}

export function ExistsGeneratorFile(tree: TreeLike, projectRoot: string, packageJson: PackageJsonWithGenerators): boolean {
  return tree.exists(GetGeneratorFilePath(projectRoot, packageJson));
}

export interface GeneratorFile {
  generators: Record<string, { factory: string, schema: string, description: string }>;
  schematics?: Record<string, { factory: string, schema: string, description: string }>;
}

export function GetGeneratorFile(
  tree: TreeLike,
  projectRoot: string,
  packageJson: PackageJsonWithGenerators,
): GeneratorFile {
  const treeAdapter = new TreeAdapter(tree);
  const generatorFile = GetGeneratorFilePath(projectRoot, packageJson);

  const content = treeAdapter.read(generatorFile)?.toString('utf-8');

  if (!content) {
    throw new Error(`The generator file ${ generatorFile } does not exists!`);
  }
  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`The generator file ${ generatorFile } is not valid json!: ${ e.message }`);
  }

}

export function ProjectRootOrNameOrConfigurationToProjectRoot(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
): string {
  if (typeof projectRootOrNameOrConfiguration === 'string') {
    if (projectRootOrNameOrConfiguration.match(/^\/?([^/]+\/)+[^/]+/)) {
      return projectRootOrNameOrConfiguration;
    } else {
      const project = GetProject(tree, projectRootOrNameOrConfiguration);
      if (project) {
        return project.root;
      } else {
        throw new Error(`The project ${ projectRootOrNameOrConfiguration } does not exists!`);
      }
    }
  } else {
    return projectRootOrNameOrConfiguration.root;
  }
}

export function GetGenerators(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
): GeneratorFile {

  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    throw new Error(`The project ${ projectRoot } does not contains a generators property!`);
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    throw new Error(`The generator file ${ GetGeneratorFilePath(projectRoot, packageJson) } does not exists!`);
  }

  return GetGeneratorFile(tree, projectRoot, packageJson);
}

export function UpdateGenerators(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
  update: (generators: GeneratorFile) => GeneratorFile,
) {
  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    throw new Error(`The project ${ projectRoot } does not contains a generators property!`);
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    throw new Error(`The generator file ${ GetGeneratorFilePath(projectRoot, packageJson) } does not exists!`);
  }

  const generators = GetGeneratorFile(tree, projectRoot, packageJson);

  CoerceFile(tree, GetGeneratorFilePath(projectRoot, packageJson), JSON.stringify(update(generators), null, 2) + '\n', true);

}

export function HasGenerators(tree: TreeLike, projectRootOrNameOrConfiguration: string | ProjectConfiguration) {

  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    return false;
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    return false;
  }

  const generators = GetGeneratorFile(tree, projectRoot, packageJson);

  if (!Object.keys(generators.generators).length) {
    return false;
  }

  return true;

}
