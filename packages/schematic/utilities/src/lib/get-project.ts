import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { ProjectConfiguration } from '@nx/devkit';
import {
  PackageJson,
  PROJECT_LOCATION_CACHE,
  UpdateProjectConfiguration,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import {
  Angular,
  AngularProject,
  GetAngularJson,
} from './angular-json-file';
import { UpdateJsonFileOptions } from './json-file';
import {
  GetPackageJson,
  UpdatePackageJsonOptions,
} from './package-json-file';
import { SearchFile } from './search-file';

interface ProjectJson extends ProjectConfiguration, Record<string, any> {
  prefix?: string;
}

export function FindProject(host: Tree, projectName: string): ProjectJson | null {
  if (PROJECT_LOCATION_CACHE.has(projectName)) {
    const path = PROJECT_LOCATION_CACHE.get(projectName)!;
    return JSON.parse(host.read(path)!.toString('utf-8')) as ProjectJson;
  }
  for (const fileEntry of SearchFile(host.root)) {
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

export function GetProject(host: Tree, projectName: string): ProjectJson {
  const projectConfiguration: ProjectJson | null = FindProject(host, projectName);

  if (!projectConfiguration) {
    throw new SchematicsException(`The project '${ projectName }' does not exists`);
  }

  return projectConfiguration;
}

export function HasProject(host: Tree, projectName: string): boolean {
  return FindProject(host, projectName) !== null;
}

export function GetProjectPrefix(host: Tree, projectName: string, defaultPrefix?: string): string {

  const project = GetProject(host, projectName);
  let prefix = project.prefix;

  if (!prefix) {
    if (!defaultPrefix) {
      throw new SchematicsException(`The project '${ projectName }' does not have a prefix`);
    }
    prefix = defaultPrefix;
  }

  return prefix;

}

/**
 * @deprecated only work in workspace with an angular.json file
 */
export function GetDefaultProjectName(host: Tree): string | null {

  const angularJson = new Angular(GetAngularJson(host));

  return angularJson.defaultProject?.name ?? Array.from(angularJson.projects.keys())[0] ?? null;

}

/**
 * @deprecated only work in workspace with an angular.json file
 */
export function GetDefaultProject(host: Tree): AngularProject | null {

  const angularJson = new Angular(GetAngularJson(host));

  return angularJson.defaultProject ?? Array.from(angularJson.projects.values())[0] ?? null;

}

/**
 * @deprecated only work in workspace with an angular.json file
 */
export function GetDefaultPrefix(host: Tree): string | null {
  return GetDefaultProject(host)?.prefix ?? null;
}

export function GetProjectRoot(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const root = project.root ?? join(GetProjectSourceRoot(host, projectName), '..');

  if (!root) {
    throw new SchematicsException(`The project '${ projectName }' does not have a root path`);
  }

  return root;

}

export function GetProjectType(host: Tree, projectName: string): 'library' | 'application' {

  const project = GetProject(host, projectName);
  const projectType = project.projectType;

  if (!projectType) {
    throw new SchematicsException(`The project '${ projectName }' does not have a project type`);
  }

  if (projectType !== 'library' && projectType !== 'application') {
    throw new SchematicsException(`The project '${ projectName }' has unknown type '${ projectType }'`);
  }

  return projectType;

}

export function GetProjectSourceRoot(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const sourceRoot = project.sourceRoot;

  if (!sourceRoot) {
    throw new SchematicsException(`The project '${ projectName }' does not have a source root path`);
  }

  return sourceRoot;

}

export function GetRelativePathToProjectRoot(host: Tree, projectName: string): string {

  const projectRoot = GetProjectRoot(host, projectName);

  return relative('/' + projectRoot, '/');

}

export function GetProjectPackageJson(host: Tree, projectName: string): PackageJson {

  const projectRoot = GetProjectRoot(host, projectName);

  return GetPackageJson(host, projectRoot);

}

export function IsProjectType(host: Tree, projectName: string, type: 'library' | 'application'): boolean {
  return GetProjectType(host, projectName) === type;
}

export function AssertProjectType(host: Tree, projectName: string, type: 'library' | 'application'): void {
  if (!IsProjectType(host, projectName, type)) {
    throw new SchematicsException(`The project '${ projectName }' has not the type '${ type }'.`);
  }
}

export function GetProjectPeerDependencies(host: Tree, projectName: string): Record<string, string> {

  const projectPackageJson = GetProjectPackageJson(host, projectName);

  return projectPackageJson.peerDependencies ?? {};

}

export interface UpdateProjectOptions extends Omit<UpdateJsonFileOptions, 'basePath'> {
  projectName: string;
}

export function UpdateProjectConfigurationRule(
  updater: (project: ProjectConfiguration, tree: Tree) => void | PromiseLike<void>,
  options: UpdateProjectOptions,
): Rule {
  return tree => UpdateProjectConfiguration(tree, updater, options);
}

export interface UpdateProjectPackageJsonOptions extends Omit<UpdatePackageJsonOptions, 'basePath'> {
  projectName: string;
}

export function UpdateProjectPackageJsonRule(
  updater: (packageJson: PackageJson) => void | PromiseLike<void>,
  options: UpdateProjectPackageJsonOptions,
): Rule {
  return tree => UpdateProjectPackageJson(tree, updater, options);
}
