import {
  ProjectGraph,
  Tree,
} from '@nx/devkit';

const GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE: Record<string, string> = {};
const GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE: Record<string, string> = {};

export function LoadProjectToPackageMapping(tree: Tree, projectGraph: ProjectGraph) {
  const projectNames = Object.keys(projectGraph.nodes);
  for (const projectName of projectNames) {
    const project = projectGraph.nodes[projectName];
    if (project.type !== 'lib') {
      continue;
    }
    const projectRoot = project.data.root;
    if (!tree.exists(`${ projectRoot }/package.json`)) {
      continue;
    }
    const packageJSON = JSON.parse(tree.read(`${ projectRoot }/package.json`)!.toString('utf-8'));
    GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageJSON.name] = projectName;
    GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName] = packageJSON.name;
  }
}

export function PackageNameToProjectName(packageName: string): string {
  if (!GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName]) {
    return GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName];
  }
  throw new Error(`Could not find project for package '${ packageName }'`);
}

export function ProjectNameToPackageName(projectName: string): string {
  if (!GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName]) {
    return GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName];
  }
  throw new Error(`Could not find package for project '${ projectName }'`);
}

export function HasProjectWithPackageName(packageName: string) {
  if (!GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  return GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName] !== undefined;
}
