import { ExecutorContext } from '@nx/devkit';
import {
  jsonFile,
  writeJsonFile,
} from '@rxap/node-utilities';
import { SortProperties } from '@rxap/utilities';
import { PackageJson } from '@rxap/workspace-utilities';
import { join } from 'path';
import { GetProjectRoot } from './project';

export interface ProjectPackageJson extends PackageJson {
  funding?: string | { type: string, url: string } | string[] | { type: string, url: string }[];
  'nx-migrations'?: { packageGroup?: Array<{ package: string, version: string }> };
}

export function readPackageJsonForProject(
  context: ExecutorContext,
  projectName = context.projectName,
): ProjectPackageJson {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');
  return jsonFile(packageJsonPath);
}

export function writePackageJsonFormProject<T extends ProjectPackageJson = ProjectPackageJson>(
  context: ExecutorContext,
  content: T,
  projectName = context.projectName,
) {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');

  content.dependencies ??= {};
  content.devDependencies ??= {};
  content.peerDependencies ??= {};
  content['nx-migrations'] ??= {};
  content['nx-migrations'].packageGroup ??= [];
  content.keywords ??= [];

  content.dependencies = SortProperties(content.dependencies);
  content.devDependencies = SortProperties(content.devDependencies);
  content.peerDependencies = SortProperties(content.dependencies);
  content['nx-migrations'].packageGroup.sort((a, b) => a.package.localeCompare(b.package));
  content.keywords.sort();

  if (Object.keys(content.dependencies).length === 0) {
    delete content.dependencies;
  }
  if (Object.keys(content.devDependencies).length === 0) {
    delete content.devDependencies;
  }
  if (Object.keys(content.peerDependencies).length === 0) {
    delete content.peerDependencies;
  }
  if (content['nx-migrations'].packageGroup.length === 0) {
    delete content['nx-migrations'].packageGroup;
  }
  if (Object.keys(content['nx-migrations']).length === 0) {
    delete content['nx-migrations'];
  }
  if (Object.keys(content.keywords).length === 0) {
    delete content.keywords;
  }

  writeJsonFile<T>(packageJsonPath, content);
}
