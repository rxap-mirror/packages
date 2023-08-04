import { ExecutorContext } from '@nx/devkit';
import {
  jsonFile,
  writeJsonFile,
} from '@rxap/node-utilities';
import { PackageJson } from '@rxap/workspace-utilities';
import { join } from 'path';
import { GetProjectRoot } from './project';

export interface ProjectPackageJsonPerson {
  name?: string;
  email?: string;
  url?: string;
}

export interface ProjectPackageJson extends PackageJson {
  publishConfig?: {
    access?: 'public' | 'restricted';
    directory?: string;
  };
  author?: string | ProjectPackageJsonPerson;
  keywords?: string[];
  homepage?: string;
  bugs?: { url?: string, email?: string };
  contributors?: string[] | ProjectPackageJsonPerson[];
  funding?: string | { type: string, url: string } | string[] | { type: string, url: string }[];
  repository?: string | { type: string, url: string, directory?: string };
  description?: string;
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
