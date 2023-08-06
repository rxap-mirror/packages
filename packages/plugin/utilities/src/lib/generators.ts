import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetPackageJson,
  GetProject,
  PackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export interface PackageJsonWithGenerators extends PackageJson {
  generators: string;
}

export function HasGeneratorProperty(packageJson: PackageJson): packageJson is PackageJsonWithGenerators {
  return !!packageJson['generators'];
}

export function GetGeneratorFilePath(projectRoot: string, packageJson: PackageJsonWithGenerators): string {

  if (!packageJson['generators']) {
    throw new Error(`The package.json of the project ${ projectRoot } does not contains a generators property!`);
  }

  return join(projectRoot, packageJson['generators']);

}

export function ExistsGeneratorFile(tree: Tree, projectRoot: string, packageJson: PackageJsonWithGenerators): boolean {
  return tree.exists(GetGeneratorFilePath(projectRoot, packageJson));
}

export interface GeneratorFile {
  generators: Record<string, { factory: string, schema: string, description: string }>;
  schematics?: Record<string, { factory: string, schema: string, description: string }>;
}

export function GetGeneratorFile(
  tree: Tree,
  projectRoot: string,
  packageJson: PackageJsonWithGenerators,
): GeneratorFile {
  const generatorFile = GetGeneratorFilePath(projectRoot, packageJson);

  const content = tree.read(generatorFile)?.toString('utf-8');

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
  tree: Tree,
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
  tree: Tree,
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
  tree: Tree,
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

  tree.write(GetGeneratorFilePath(projectRoot, packageJson), JSON.stringify(update(generators), null, 2));

}

export function HasGenerators(tree: Tree, projectRootOrNameOrConfiguration: string | ProjectConfiguration) {

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
