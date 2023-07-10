import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { relative } from 'path';
import {
  Angular,
  AngularProject,
  GetAngularJson,
} from './angular-json-file';
import { PackageJson } from './package-json';
import {
  GetPackageJson,
  UpdatePackageJson,
  UpdatePackageJsonOptions,
} from './package-json-file';

export function GetProject(host: Tree, projectName: string): AngularProject {

  const angularJson = new Angular(GetAngularJson(host));

  if (!angularJson.projects.has(projectName)) {
    throw new SchematicsException(`The project '${ projectName }' does not exists.`);
  }

  return angularJson.projects.get(projectName)!;
}

export function HasProject(host: Tree, projectName: string): boolean {
  const angularJson = new Angular(GetAngularJson(host));
  return angularJson.projects.has(projectName);
}

export function GetProjectPrefix(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const prefix = project.prefix;

  if (!prefix) {
    throw new SchematicsException(`The project '${ projectName }' does not have a prefix`);
  }

  return prefix;

}

export function GetDefaultProjectName(host: Tree): string | null {

  const angularJson = new Angular(GetAngularJson(host));

  return angularJson.defaultProject?.name ?? Array.from(angularJson.projects.keys())[0] ?? null;

}

export function GetDefaultProject(host: Tree): AngularProject | null {

  const angularJson = new Angular(GetAngularJson(host));

  return angularJson.defaultProject ?? Array.from(angularJson.projects.values())[0] ?? null;

}

export function GetDefaultPrefix(host: Tree): string | null {
  return GetDefaultProject(host)?.prefix ?? null;
}

export function GetProjectRoot(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const root = project.root;

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

export interface UpdateProjectPackageJsonOptions extends Omit<UpdatePackageJsonOptions, 'basePath'> {
  projectName: string;
}

export function UpdateProjectPackageJson(
  updater: (packageJson: PackageJson) => void | PromiseLike<void>,
  options: UpdateProjectPackageJsonOptions,
): Rule {
  return tree => {

    const projectRoot = GetProjectRoot(tree, options.projectName);

    return UpdatePackageJson(updater, {
      ...options,
      basePath: projectRoot,
    });

  };
}
