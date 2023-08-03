import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  readFileSync,
} from 'fs';

const PACKAGE_NAME_TO_PROJECT_NAME_CACHE: Record<string, string> = {};
const PROJECT_NAME_TO_PACKAGE_NAME_CACHE: Record<string, string> = {};

export function LoadProjectToPackageMapping(context: ExecutorContext) {

  const { projectGraph } = context;

  if (!projectGraph) {
    throw new Error('The projectGraph is undefined. Ensure the projectGraph is passed into the executor context.');
  }

  const projectNames = Object.keys(projectGraph.nodes);
  for (const projectName of projectNames) {
    const project = projectGraph.nodes[projectName];
    if (project.type !== 'lib') {
      continue;
    }
    const projectRoot = project.data.root;
    if (!existsSync(`${ projectRoot }/package.json`)) {
      continue;
    }
    const packageJSON = JSON.parse(readFileSync(`${ projectRoot }/package.json`)!.toString('utf-8'));
    PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageJSON.name] = projectName;
    PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName] = packageJSON.name;
  }
}

export function PackageNameToProjectName(packageName: string): string {
  if (!PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName]) {
    return PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName];
  }
  throw new Error(`Could not find project for package '${ packageName }'`);
}

export function ProjectNameToPackageName(projectName: string): string {
  if (!PROJECT_NAME_TO_PACKAGE_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName]) {
    return PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName];
  }
  throw new Error(`Could not find package for project '${ projectName }'`);
}

export function HasProjectWithPackageName(packageName: string) {
  if (!PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  return PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName] !== undefined;
}
