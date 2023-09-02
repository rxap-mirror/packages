import { ProjectConfiguration } from '@nx/devkit';
import {
  clone,
  equals,
} from '@rxap/utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { UpdateJsonFileOptions } from './json-file';
import { PackageJson } from './package-json';
import {
  GetPackageJson,
  UpdatePackageJson,
  UpdatePackageJsonOptions,
} from './package-json-file';
import { SearchFile } from './search-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

interface ProjectJson extends ProjectConfiguration, Record<string, any> {
  prefix?: string;
}

export const PROJECT_LOCATION_CACHE = new Map<string, string>();

export function FindProject<Tree extends TreeLike>(tree: Tree, projectName: string): ProjectJson | null {
  if (PROJECT_LOCATION_CACHE.has(projectName)) {
    const path = PROJECT_LOCATION_CACHE.get(projectName)!;
    const treeAdapter = new TreeAdapter(tree);
    const project = JSON.parse(treeAdapter.read(path)!.toString('utf-8')) as ProjectJson;
    project.root ??= dirname(path).replace(/^\//, '');
    return project;
  }
  for (const fileEntry of SearchFile(tree)) {
    if (!fileEntry.path.endsWith('project.json')) {
      continue;
    }
    const project = JSON.parse(fileEntry.content.toString('utf-8')) as ProjectJson;
    if (project.name === projectName) {
      project.root ??= dirname(fileEntry.path).replace(/^\//, '');
      PROJECT_LOCATION_CACHE.set(projectName, fileEntry.path);
      return project;
    }
  }
  return null;
}

export function GetProject<Tree extends TreeLike>(tree: Tree, projectName: string): ProjectJson {
  const projectConfiguration: ProjectJson | null = FindProject(tree, projectName);

  if (!projectConfiguration) {
    throw new Error(`The project '${ projectName }' does not exists`);
  }

  return projectConfiguration;
}

export function HasProject<Tree extends TreeLike>(tree: Tree, projectName: string): boolean {
  return FindProject(tree, projectName) !== null;
}

export function GetProjectPrefix<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  defaultPrefix?: string,
): string {

  const project = GetProject(tree, projectName);
  let prefix = project.prefix;

  if (!prefix) {
    if (!defaultPrefix) {
      throw new Error(`The project '${ projectName }' does not have a prefix`);
    }
    prefix = defaultPrefix;
  }

  return prefix;

}

export function GetProjectRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string {

  const project = GetProject(tree, projectName);
  const root = project.root;

  if (!root) {
    throw new Error(`The project '${ projectName }' does not have a root path`);
  }

  return root;

}

export function GetProjectType<Tree extends TreeLike>(tree: Tree, projectName: string): 'library' | 'application' {

  const project = GetProject(tree, projectName);
  const projectType = project.projectType;

  if (!projectType) {
    throw new Error(`The project '${ projectName }' does not have a project type`);
  }

  if (projectType !== 'library' && projectType !== 'application') {
    throw new Error(`The project '${ projectName }' has unknown type '${ projectType }'`);
  }

  return projectType;

}

export function GetProjectSourceRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string {

  const project = GetProject(tree, projectName);
  const sourceRoot = project.sourceRoot;

  if (!sourceRoot) {
    throw new Error(`The project '${ projectName }' does not have a source root path`);
  }

  return sourceRoot;

}

export function GetRelativePathToProjectRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string {

  const projectRoot = GetProjectRoot(tree, projectName);

  return relative('/' + projectRoot, '/');

}

export function GetProjectPackageJson<Tree extends TreeLike>(tree: Tree, projectName: string): PackageJson {

  const projectRoot = GetProjectRoot(tree, projectName);

  return GetPackageJson(tree, projectRoot);

}

export function IsProjectType<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  type: 'library' | 'application',
): boolean {
  return GetProjectType(tree, projectName) === type;
}

export function AssertProjectType<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  type: 'library' | 'application',
): void {
  if (!IsProjectType(tree, projectName, type)) {
    throw new Error(`The project '${ projectName }' has not the type '${ type }'.`);
  }
}

export function GetProjectPeerDependencies<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
): Record<string, string> {

  const projectPackageJson = GetProjectPackageJson(tree, projectName);

  return projectPackageJson.peerDependencies ?? {};

}

export interface UpdateProjectOptions extends Omit<UpdateJsonFileOptions, 'basePath'> {
  projectName: string;
}

export async function UpdateProjectConfiguration<Tree extends TreeLike>(
  tree: Tree,
  updater: (project: ProjectConfiguration, tree: Tree) => void | PromiseLike<void>,
  options: UpdateProjectOptions,
) {
  const project = GetProject(tree, options.projectName);
  const deepClone = clone(project);

  await updater(project, tree);

  if (!equals(deepClone, project)) {
    const projectRoot = project.root;
    delete (project as any).root;
    const treeAdapter = new TreeAdapter(tree);
    treeAdapter.overwrite(join(projectRoot, 'project.json'), JSON.stringify(project, undefined, 2));
  }
}

export interface UpdateProjectPackageJsonOptions extends Omit<UpdatePackageJsonOptions, 'basePath'> {
  projectName: string;
}

export function UpdateProjectPackageJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (packageJson: PackageJson) => void | PromiseLike<void>,
  options: UpdateProjectPackageJsonOptions,
) {
  const projectRoot = GetProjectRoot(tree, options.projectName);

  return UpdatePackageJson(tree, updater, {
    ...options,
    basePath: projectRoot,
  });

}
