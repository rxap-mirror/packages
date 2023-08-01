import {
  createProjectGraphAsync,
  getProjects,
  Tree,
} from '@nx/devkit';
import { AddDir } from '@rxap/generator-ts-morph';
import { GetProjectRoot } from '@rxap/generator-utilities';
import { GetLatestPackageVersion } from '@rxap/node-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { ProjectGraph } from 'nx/src/config/project-graph';
import { join } from 'path';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';
import { FixDependenciesGeneratorSchema } from './schema';

function resolveProjectDependencies(
  projectGraph: ProjectGraph,
  project: string,
  resolved: string[] = [],
): string[] {
  if (resolved.includes(project)) {
    return [];
  }
  const dependencies: string[] = [];
  const projectDependencies = projectGraph.dependencies[project];
  for (const dependency of projectDependencies) {
    if (!dependency.target.startsWith('npm:')) {
      dependencies.push(dependency.target);
      dependencies.push(...resolveProjectDependencies(
        projectGraph,
        dependency.target,
        [ ...resolved, dependency.target, project ],
      ));
    }
  }
  return dependencies.filter((value, index, array) => array.indexOf(value) === index);
}

function getPackageListFromSourceFiles(project: Project): string[] {
  const packageList: string[] = [];

  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

      if (moduleSpecifier.startsWith('.')) {
        return;
      }

      const match = moduleSpecifier.match(/^([^@][^/]+)\/.+$/) || moduleSpecifier.match(/^(@[^/]+\/[^/]+)\/.+/);
      let packageName: string;
      if (match) {
        packageName = match[1];
      } else {
        packageName = moduleSpecifier;
      }

      if (!packageList.includes(packageName)) {
        packageList.push(packageName);
        console.log(`Add package ${ packageName } from source file ${ sourceFile.getFilePath() }`);
      }
    });
  });

  return packageList
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter(packageName => !PACKAGE_ADD_BLACK_LIST.some(regexOrString => typeof regexOrString === 'string' ?
      regexOrString === packageName :
      regexOrString.test(packageName)));
}

const TESTING_FILE_EXTENSIONS = [
  'cypress.config.ts',
  '.spec.ts',
  '.e2e-spec.ts',
  '.stories.ts',
  'test-setup.ts',
  '.cy.ts',
];

const TESTING_FOLDERS = [ 'cypress', '.storybook' ];

const PACKAGE_REMOVE_BLACK_LIST = [ 'tslib' ];
const PACKAGE_ADD_BLACK_LIST = [
  /@firebase/,
  'fs',
  'path',
  'child_process',
  'os',
  'crypto',
  'util',
  'events',
  'stream',
  'assert',
  'tty',
  'net',
  'dns',
  'tls',
  'http',
  'https',
  'zlib',
  'url',
  'querystring',
  'punycode',
  'string_decoder',
  'http2',
  'perf_hooks',
  'worker_threads',
  'v8',
  'vm',
  'async_hooks',
  'inspector',
  'trace_events',
  'console',
  'buffer',
  'constants',
  'v8',
  'domain',
  'readline',
  'repl',
  'timers',
  'module',
  'process',
  'cluster',
  'dgram',
  'fs/promises',
  'perf_hooks',
  'readline',
  'repl',
  'string_decoder',
  'tls/promises',
  'trace_events',
  'tty',
  'worker_threads',
  'zlib/promises',
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'console',
  'crypto',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'net',
  'os',
  'path',
  'querystring',
  'stream',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'zlib',
  'glob',
  'fs-extra',
];

const PACKAGE_NAME_TO_PROJECT_NAME_CACHE: Record<string, string> = {};
const PROJECT_NAME_TO_PACKAGE_NAME_CACHE: Record<string, string> = {};

function loadProjectToPackageMapping(tree: Tree, projectGraph: ProjectGraph) {
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
    PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageJSON.name] = projectName;
    PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName] = packageJSON.name;
  }
}

function packageNameToProjectName(packageName: string): string {
  if (PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName]) {
    return PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName];
  }
  throw new Error(`Could not find project for package '${ packageName }'`);
}

function projectNameToPackageName(projectName: string): string {
  if (PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName]) {
    return PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName];
  }
  throw new Error(`Could not find package for project '${ projectName }'`);
}

function hasProjectWithPackageName(packageName: string) {
  return PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName] !== undefined;
}

function addDependedProjects(
  projectGraph: ProjectGraph,
  tree: Tree,
  packageName: string,
  projectRoot: string,
  dependencies: Record<string, string>,
) {
  const projectName = packageNameToProjectName(packageName);
  const dependedProjectList = resolveProjectDependencies(projectGraph, projectName);
  for (const dependedProject of dependedProjectList) {
    const dependedPackageName = projectNameToPackageName(dependedProject);
    if (!dependencies[dependedPackageName]) {
      dependencies[dependedPackageName] = findBasePackageVersion(tree, dependedPackageName, projectRoot);
    }
  }
}

function fixPeerDependenciesWithTsMorphProject(
  projectGraph: ProjectGraph,
  tree: Tree,
  projectRoot: string,
  {
    dependencies,
    peerDependencies,
    devDependencies,
  }: ProjectPackageJson,
) {

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useInMemoryFileSystem: true,
  });

  AddDir(
    tree,
    projectRoot,
    project,
    (fileName, path) => !path.includes('node_modules') &&
      fileName.endsWith('.ts') &&
      !TESTING_FOLDERS.map(folder => join(projectRoot, folder)).some(folder => path.includes(folder)) &&
      !TESTING_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext)),
  );

  const packageList: string[] = getPackageListFromSourceFiles(project);

  const addedPackageList: string[] = [];
  const changedPackageList: string[] = [];
  const removedPackageList: string[] = [];
  const unknownPackageList: string[] = [];

  for (const packageName of Object.keys(peerDependencies)) {
    if (!packageList.includes(packageName) && !PACKAGE_REMOVE_BLACK_LIST.includes(packageName)) {
      removedPackageList.push(`${ packageName }@${ peerDependencies[packageName] } from peerDependencies`);
      delete peerDependencies[packageName];
    }
  }
  for (const packageName of Object.keys(dependencies)) {
    if (!packageList.includes(packageName) && !PACKAGE_REMOVE_BLACK_LIST.includes(packageName)) {
      removedPackageList.push(`${ packageName }@${ dependencies[packageName] } from dependencies`);
      delete dependencies[packageName];
    }
  }

  for (const packageName of packageList) {
    if (hasProjectWithPackageName(packageName)) {
      if (!dependencies[packageName]) {
        peerDependencies[packageName] = peerDependencies[packageName] ?? '*';
      }
    } else {
      if (!dependencies[packageName]) {
        const version = findBasePackageVersion(tree, packageName, projectRoot);
        if (peerDependencies[packageName]) {
          if (peerDependencies[packageName] !== version) {
            changedPackageList.push(`${ packageName }@${ peerDependencies[packageName] } -> ${ version }`);
            peerDependencies[packageName] = version;
          }
        } else {
          addedPackageList.push(`${ packageName }@${ version }`);
          peerDependencies[packageName] = version;
        }
        if (version === 'latest') {
          unknownPackageList.push(packageName);
        }
        peerDependencies[packageName] = version;
      }
    }
  }

  return {
    addedPackageList,
    changedPackageList,
    removedPackageList,
    unknownPackageList,
  };

}

function fixDevDependenciesWithTsMorphProject(
  projectGraph: ProjectGraph,
  tree: Tree,
  projectRoot: string,
  {
    dependencies,
    peerDependencies,
    devDependencies,
  }: ProjectPackageJson,
) {

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useInMemoryFileSystem: true,
  });

  AddDir(
    tree,
    projectRoot,
    project,
    (fileName, path) => !path.includes('node_modules') &&
      fileName.endsWith('.ts') &&
      !TESTING_FOLDERS.map(folder => join(projectRoot, folder)).some(folder => path.includes(folder)) &&
      TESTING_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext)),
  );

  const packageList: string[] = getPackageListFromSourceFiles(project);

  const addedPackageList: string[] = [];
  const changedPackageList: string[] = [];
  const removedPackageList: string[] = [];
  const unknownPackageList: string[] = [];

  for (const packageName of Object.keys(devDependencies)) {
    if (!packageList.includes(packageName) &&
      !peerDependencies[packageName] &&
      !PACKAGE_REMOVE_BLACK_LIST.includes(packageName)) {
      removedPackageList.push(`${ packageName }@${ devDependencies[packageName] } from devDependencies`);
      delete devDependencies[packageName];
    }
  }

  for (const packageName of packageList) {
    if (hasProjectWithPackageName(packageName)) {
      if (!peerDependencies[packageName] && !dependencies[packageName]) {
        devDependencies[packageName] = '*';
      }
    } else {
      if (!peerDependencies[packageName] && !dependencies[packageName]) {
        const version = findBasePackageVersion(tree, packageName, projectRoot);
        if (devDependencies[packageName]) {
          if (devDependencies[packageName] !== version) {
            changedPackageList.push(`${ packageName }@${ devDependencies[packageName] } -> ${ version }`);
            devDependencies[packageName] = version;
          }
        } else {
          addedPackageList.push(`${ packageName }@${ version }`);
          devDependencies[packageName] = version;
        }
        if (version === 'latest') {
          unknownPackageList.push(packageName);
        }
        devDependencies[packageName] = version;
      }
    }
  }

  return {
    addedPackageList,
    changedPackageList,
    removedPackageList,
    unknownPackageList,
  };

}

const PACKAGE_VERSION_MAP: Record<string, Record<string, string>> = {};

function loadAvailablePackageVersion(tree: Tree, projectRoot: string) {
  PACKAGE_VERSION_MAP[projectRoot] = {};

  function updateMap(dependencies: Record<string, string> | undefined): void {
    for (const [ packageName, version ] of Object.entries(dependencies ?? {})) {
      if (version !== '*' && !hasProjectWithPackageName(packageName)) {
        if (!PACKAGE_VERSION_MAP[packageName]) {
          PACKAGE_VERSION_MAP[projectRoot][packageName] = version;
        }
      }
    }
  }

  function pinVersionToMajorRelease(versionMap: Record<string, string>) {
    for (const [ packageName, version ] of Object.entries(versionMap)) {
      if (version.startsWith('~')) {
        versionMap[packageName] = version.replace('~', '^');
      }
      if (version.match(/^\d+/)) {
        versionMap[packageName] = `^${ version }`;
      }
    }
  }

  let workingDirectory = '/' + projectRoot;
  let lastWorkingDirectory = '';
  do {
    if (tree.exists(join(workingDirectory, 'package.json'))) {
      const packageJson: ProjectPackageJson = JSON.parse(tree.read(join(workingDirectory, 'package.json'))!.toString(
        'utf-8'));
      updateMap(packageJson.dependencies);
      updateMap(packageJson.peerDependencies);
      updateMap(packageJson.devDependencies);
      updateMap(packageJson.optionalDependencies);
    }
    lastWorkingDirectory = workingDirectory;
    workingDirectory = join(workingDirectory, '..');
  } while (workingDirectory !== lastWorkingDirectory);

  pinVersionToMajorRelease(PACKAGE_VERSION_MAP[projectRoot]);
}

function findBasePackageVersion(tree: Tree, packageName: string, projectRoot: string): string {
  if (!PACKAGE_VERSION_MAP[projectRoot]) {
    throw new Error('Package version map not loaded. Ensure the loadAvailablePackageVersion function is called before.');
  }
  if (PACKAGE_VERSION_MAP[projectRoot][packageName]) {
    return PACKAGE_VERSION_MAP[projectRoot][packageName];
  }
  return 'latest';
}

function printReport(
  {
    addedPackageList,
    changedPackageList,
    removedPackageList,
    unknownPackageList,
  }: {
    addedPackageList: string[];
    changedPackageList: string[];
    removedPackageList: string[];
    unknownPackageList: string[];
  },
) {
  if (addedPackageList.length) {
    console.log(`Added packages: ${ addedPackageList.length }`);
    console.log(addedPackageList.join('\n'));
  }
  if (changedPackageList.length) {
    console.log(`Changed packages: ${ changedPackageList.length }`);
    console.log(changedPackageList.join('\n'));
  }
  if (removedPackageList.length) {
    console.log(`Removed packages: ${ removedPackageList.length }`);
    console.log(removedPackageList.join('\n'));
  }
  if (unknownPackageList.length) {
    console.log(`Unknown packages: ${ unknownPackageList.length }`);
    console.log(unknownPackageList.join('\n'));
  }
}

function skipProject(tree: Tree, project: string, projectRoot: string, projects: string[] = []) {
  if (projects.length && !projects.includes(project)) {
    console.debug(`Skip project ${ project } because it is not in the list of projects`);
    return true;
  }
  if (projectRoot === '.') {
    console.debug('skip root project');
    return true;
  }
  if (!tree.exists(`${ projectRoot }/package.json`)) {
    console.debug(`No package.json file found in ${ projectRoot }`);
    return true;
  }
  return false;
}

const RESOLVED_PACKAGE_VERSION_MAP: Record<string, string> = {};

export async function resolveLatestPackageVersion(packageName: string) {
  if (RESOLVED_PACKAGE_VERSION_MAP[packageName]) {
    return RESOLVED_PACKAGE_VERSION_MAP[packageName];
  }
  return RESOLVED_PACKAGE_VERSION_MAP[packageName] = await GetLatestPackageVersion(packageName);
}

export async function replaceLatestPackageVersionForProject(tree: Tree, projectName: string) {
  console.log(`Replace latest package version for project ${ projectName }`);
  const projectRoot = GetProjectRoot(tree, projectName);
  const packageJson: ProjectPackageJson = JSON.parse(tree.read(join(projectRoot, 'package.json'))!.toString('utf-8'));
  const dependencies = packageJson.dependencies;
  const peerDependencies = packageJson.peerDependencies;
  const devDependencies = packageJson.devDependencies;
  const optionalDependencies = packageJson.optionalDependencies;

  async function replaceLatestPackageVersion(dependencies: Record<string, string> | undefined): Promise<void> {
    for (const [ packageName, version ] of Object.entries(dependencies ?? {})) {
      if (version === 'latest') {
        const resolvedVersion = await resolveLatestPackageVersion(packageName);
        if (resolvedVersion !== 'latest') {
          dependencies![packageName] = resolvedVersion;
          console.log(`Replace latest version of ${ packageName } with ${ resolvedVersion }`);
        }
      }
    }
  }

  await replaceLatestPackageVersion(dependencies);
  await replaceLatestPackageVersion(peerDependencies);
  await replaceLatestPackageVersion(devDependencies);
  await replaceLatestPackageVersion(optionalDependencies);

  tree.write(join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
}

export function removePackageFromDependencies(packageName: string, dependencies: Record<string, string>) {
  if (dependencies[packageName]) {
    delete dependencies[packageName];
  }
}

export function removeSelfReferenceFromDependencies(projectName: string, {
  dependencies,
  peerDependencies,
  devDependencies,
  optionalDependencies,
}: ProjectPackageJson) {
  const packageName = projectNameToPackageName(projectName);
  removePackageFromDependencies(packageName, dependencies);
  removePackageFromDependencies(packageName, peerDependencies);
  removePackageFromDependencies(packageName, devDependencies);
  removePackageFromDependencies(packageName, optionalDependencies);
}

/**
 * This generator tries to fix the dependencies in the project.json of the project
 *
 * 1. Load all not-test typescript files from the project
 *    1.1. Find all import statements
 *      a. If a project with the package name exists add it to the peerDependencies with version '*'. (skip if the package is already in the dependencies)
 *      b. If external package add it to the peerDependencies with the version from a parent package.json or 'latest' if not found.
 * 2. Load all test typescript files from the project
 *  2.1. Find all import statements
 *    a. If a project with the package name exists add it to the devDependencies with version '*'. (skip if the package is already in the dependencies)
 *      - for each project that is use in the test files add it direct and indirect dependencies to the devDependencies TODO : check if that is required
 *    b. If external package add it to the devDependencies with the version from a parent package.json or 'latest' if not found.
 *
 * 3. print a report about the changes
 *
 * @param tree
 * @param options
 */
export async function fixDependenciesGenerator(
  tree: Tree,
  options: FixDependenciesGeneratorSchema,
) {

  if (!options.verbose) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.debug = () => {
    };
  }

  if (options.reset || options.resetAll) {
    getProjects(tree).forEach((project, projectName) => {
      const projectRoot = project.root;
      if (skipProject(tree, projectName, projectRoot, options.projects)) {
        return;
      }
      const packageJson = JSON.parse(tree.read(`${ projectRoot }/package.json`)!.toString('utf-8'));
      if (options.resetAll) {
        packageJson.dependencies = {};
      }
      packageJson.peerDependencies = {};
      packageJson.devDependencies = {};
      packageJson.optionalDependencies = {};
      tree.write(`${ projectRoot }/package.json`, JSON.stringify(packageJson, null, 2) + '\n');
    });
  }

  const projectGraph = await createProjectGraphAsync();
  loadProjectToPackageMapping(tree, projectGraph);

  const unknownPackageMap: Record<string, string[]> = {};
  const latestTsLibVersion = await resolveLatestPackageVersion('tslib');

  getProjects(tree).forEach((project, projectName) => {
    const projectRoot = project.root;
    if (skipProject(tree, projectName, projectRoot, options.projects) || project.projectType !== 'library') {
      return;
    }

    const packageJson = JSON.parse(tree.read(`${ projectRoot }/package.json`)!.toString('utf-8'));
    packageJson.dependencies ??= {};
    packageJson.peerDependencies ??= {};
    packageJson.devDependencies ??= {};
    packageJson.optionalDependencies ??= {};

    if (!packageJson.dependencies['tslib']) {
      packageJson.dependencies['tslib'] = latestTsLibVersion;
    }

    loadAvailablePackageVersion(tree, projectRoot);

    const peerReport = fixPeerDependenciesWithTsMorphProject(projectGraph, tree, projectRoot, packageJson);

    removeSelfReferenceFromDependencies(projectName, packageJson);

    console.log(`====================  Report for project ${ projectName }`);
    console.log('========== Peer dependencies:');
    printReport(peerReport);

    unknownPackageMap[projectName] = peerReport.unknownPackageList.filter((packageName, index, self) => self.indexOf(
      packageName) === index);

    if (Object.keys(packageJson.dependencies).length === 0) {
      delete packageJson.dependencies;
    }
    if (Object.keys(packageJson.peerDependencies).length === 0) {
      delete packageJson.peerDependencies;
    }
    if (Object.keys(packageJson.devDependencies).length === 0) {
      delete packageJson.devDependencies;
    }
    if (Object.keys(packageJson.optionalDependencies).length === 0) {
      delete packageJson.optionalDependencies;
    }

    tree.write(`${ projectRoot }/package.json`, JSON.stringify(packageJson, null, 2) + '\n');

  });

  const unknownPackageMapToProject: Record<string, string[]> = {};

  for (const [ projectName, packageList ] of Object.entries(unknownPackageMap)) {
    for (const packageName of packageList) {
      if (!unknownPackageMapToProject[packageName]) {
        unknownPackageMapToProject[packageName] = [];
      }
      unknownPackageMapToProject[packageName].push(projectName);
    }
  }

  if (Object.keys(unknownPackageMapToProject).length) {
    console.log(`============================================================`);
    console.log(`Unknown packages: ${ Object.keys(unknownPackageMapToProject).length }`);
    console.log(Object.entries(unknownPackageMapToProject)
                      .map(([ packageName, projectNameList ]) => `${ packageName }: ${ projectNameList.join(', ') }`)
                      .join('\n'));
    console.log('============================================================');
    console.log('Use the option --resolve to replace all latest version with the latest version from npm');
    if (options.strict) {
      throw new Error('Packages with unknown version found');
    }
  }

  if (options.resolve) {
    for (const [ projectName ] of Object.entries(unknownPackageMap)) {
      await replaceLatestPackageVersionForProject(tree, projectName);
    }
  }

}

export default fixDependenciesGenerator;
