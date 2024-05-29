import { ExecutorContext } from '@nx/devkit';
import {
  jsonFile,
  jsonFileWithRetry,
  writeJsonFile,
} from '@rxap/node-utilities';
import {
  CleanupPackageJsonFile,
  PackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { GetProjectRoot } from './project';

export interface ProjectPackageJson extends PackageJson {
  funding?: string | { type: string, url: string } | string[] | { type: string, url: string }[];
}

export function readPackageJsonForProject(
  context: ExecutorContext,
  projectName = context.projectName,
): ProjectPackageJson {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');
  return jsonFile(packageJsonPath);
}

export function readPackageJsonForProjectWithRetry(
  context: ExecutorContext,
  projectName = context.projectName,
  retries = 3, sleep = 3000
): Promise<ProjectPackageJson> {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');
  return jsonFileWithRetry(packageJsonPath, retries, sleep);
}

export function writePackageJsonFormProject<T extends ProjectPackageJson = ProjectPackageJson>(
  context: ExecutorContext,
  content: T,
  projectName = context.projectName,
) {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');
  writeJsonFile<T>(packageJsonPath, CleanupPackageJsonFile(content));
}
