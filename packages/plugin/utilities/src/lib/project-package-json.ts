import { ExecutorContext } from '@nx/devkit';
import {
  jsonFile,
  writeJsonFile,
} from '@rxap/node-utilities';
import { PackageJson } from '@rxap/workspace-utilities';
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

export function writePackageJsonFormProject<T = ProjectPackageJson>(
  context: ExecutorContext,
  content: T,
  projectName = context.projectName,
) {
  const packageJsonPath = join(context.root, GetProjectRoot(context, projectName), 'package.json');
  writeJsonFile<T>(packageJsonPath, content);
}
