import {
  createProjectGraphAsync,
  getProjects,
  ProjectConfiguration,
  ProjectGraph,
  Tree,
} from '@nx/devkit';
import { GetLatestPackageVersion } from '@rxap/node-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { CreateProject } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  unique,
} from '@rxap/utilities';
import { AddDir } from '@rxap/workspace-ts-morph';
import {
  CoerceAssets,
  CoerceFile,
  Dependency,
  ForEachSecondaryEntryPoint,
  GetProjectPackageJson,
  GetProjectRoot,
  GetRootPackageJson,
  HasProjectWithPackageName,
  IsAngularProject,
  LoadProjectToPackageMapping,
  NgPackageJson,
  PackageJson,
  PackageNameToProjectName,
  ProjectNameToPackageName,
  SkipNonPublishableProject,
  SkipProjectOptions,
  UpdateJsonFile,
  UpdatePackageJson,
} from '@rxap/workspace-utilities';
import { join, dirname } from 'path';
import { Project } from 'ts-morph';
import { FixDependenciesGeneratorSchema } from './schema';
import 'colors';

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

const TESTING_FOLDERS = [ 'cypress', '.storybook', 'compodoc', 'docs', '.nyc_output', 'coverage', '.angular' ];

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
  'express',
  'axios',
];

const PACKAGE_PEER_DEPENDENCIES_BLACK_LIST = [ 'tslib' ];

const PACKAGE_FORCED_PEER_DEPENDENCIES: Array<string | RegExp> = [ 'rxjs', /@angular\//, /@nestjs\//, /@storybook\//, /@types\// ];

function addDependedProjects(
  projectGraph: ProjectGraph,
  tree: Tree,
  packageName: string,
  projectRoot: string,
  dependencies: Record<string, string>,
) {
  const projectName = PackageNameToProjectName(packageName);
  const dependedProjectList = resolveProjectDependencies(projectGraph, projectName);
  for (const dependedProject of dependedProjectList) {
    const dependedPackageName = ProjectNameToPackageName(dependedProject);
    if (!dependencies[dependedPackageName]) {
      dependencies[dependedPackageName] = findBasePackageVersion(dependedPackageName, projectRoot);
    }
  }
}

function getUsedPackagesFromSourceRoot(tree: Tree, projectSourceRoot: string) {
  const project = CreateProject();

  AddDir(
    tree,
    projectSourceRoot,
    project,
    (fileName, path) => !path.includes('node_modules') &&
                        fileName.endsWith('.ts') &&
                        !TESTING_FOLDERS.map(folder => join(projectSourceRoot, folder)).some(folder => path.includes(folder)) &&
                        !TESTING_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext)),
  );

  return getPackageListFromSourceFiles(project);
}

function getProjectPackageVersion(tree: Tree, projectName: string): string {
  const packageJson = GetProjectPackageJson(tree, projectName);
  return packageJson.version ?? '*';
}

function fixDependenciesWithTsMorphProject(
  project: ProjectConfiguration,
  tree: Tree,
  projectRoot: string,
  packageJson: ProjectPackageJson,
) {

  let peerDependencyList: string[] = [];
  let dependencyList: string[] = [];

  if (tree.exists(join(projectRoot, 'src'))) {
    const projectSourceRoot = join(projectRoot, 'src');
    if (tree.exists(join(projectSourceRoot, 'lib'))) {
      const packageList = getUsedPackagesFromSourceRoot(tree, join(projectSourceRoot, 'lib'));
      peerDependencyList = peerDependencyList.concat(packageList);
    }
    if (tree.exists(join(projectSourceRoot, 'generators'))) {
      const packageList = getUsedPackagesFromSourceRoot(tree, join(projectSourceRoot, 'generators'));
      dependencyList = dependencyList.concat(packageList);
    }
    if (tree.exists(join(projectSourceRoot, 'migrations'))) {
      const packageList = getUsedPackagesFromSourceRoot(tree, join(projectSourceRoot, 'migrations'));
      dependencyList = dependencyList.concat(packageList);
    }
    if (tree.exists(join(projectSourceRoot, 'schematics'))) {
      const packageList = getUsedPackagesFromSourceRoot(tree, join(projectSourceRoot, 'schematics'));
      dependencyList = dependencyList.concat(packageList);
    }
    if (tree.exists(join(projectSourceRoot, 'executors'))) {
      const packageList = getUsedPackagesFromSourceRoot(tree, join(projectSourceRoot, 'executors'));
      dependencyList = dependencyList.concat(packageList);
    }
  }

  console.log('Check secondary entry points'.cyan);
  for (const ngPackageJsonFilePath of ForEachSecondaryEntryPoint(tree, projectRoot)) {
    const path = dirname(ngPackageJsonFilePath);
    console.log('Check secondary entry point: ' + path.blue);
    if (tree.exists(join(path, 'src'))) {
      const entryPointSourceRoot = join(path, 'src');
      if (tree.exists(join(entryPointSourceRoot, 'lib'))) {
        const packageList = getUsedPackagesFromSourceRoot(tree, join(entryPointSourceRoot, 'lib'));
        peerDependencyList = peerDependencyList.concat(packageList);
      }
    }
  }

  peerDependencyList = peerDependencyList.filter(peerDependency => !dependencyList.includes(peerDependency));
  peerDependencyList = peerDependencyList.filter(unique());
  dependencyList = dependencyList.filter(unique());

  const addedPackageList: string[] = [];
  const changedPackageList: string[] = [];
  const removedPackageList: string[] = [];
  const unknownPackageList: string[] = [];

  packageJson.peerDependencies ??= {};
  packageJson.dependencies ??= {};

  const {
    dependencies,
    peerDependencies,
  } = packageJson;

  for (const packageName of Object.keys(peerDependencies)) {
    if (!peerDependencyList.includes(packageName) && !PACKAGE_REMOVE_BLACK_LIST.includes(packageName)) {
      removedPackageList.push(`${ packageName }@${ peerDependencies[packageName] } from peerDependencies`);
      delete peerDependencies[packageName];
    }
  }
  for (const packageName of Object.keys(dependencies)) {
    if (!dependencyList.includes(packageName) && !PACKAGE_REMOVE_BLACK_LIST.includes(packageName)) {
      removedPackageList.push(`${ packageName }@${ dependencies[packageName] } from dependencies`);
      delete dependencies[packageName];
    }
  }

  for (const packageName of peerDependencyList) {
    if (HasProjectWithPackageName(packageName)) {
      peerDependencies[packageName] = peerDependencies[packageName] ?? '^' + getProjectPackageVersion(tree, PackageNameToProjectName(packageName));
    } else {
      const version = findBasePackageVersion(packageName, projectRoot);
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

  for (const packageName of dependencyList) {
    if (HasProjectWithPackageName(packageName)) {
      dependencies[packageName] = dependencies[packageName] ?? '^' + getProjectPackageVersion(tree, PackageNameToProjectName(packageName));
    } else {
      const version = findBasePackageVersion(packageName, projectRoot);
      if (dependencies[packageName]) {
        if (dependencies[packageName] !== version) {
          changedPackageList.push(`${ packageName }@${ dependencies[packageName] } -> ${ version }`);
          dependencies[packageName] = version;
        }
      } else {
        addedPackageList.push(`${ packageName }@${ version }`);
        dependencies[packageName] = version;
      }
      if (version === 'latest') {
        unknownPackageList.push(packageName);
      }
      dependencies[packageName] = version;
    }
  }

  if (IsAngularProject(project)) {
    if (!tree.exists(join(projectRoot, 'ng-package.json'))) {
      throw new Error('The project is an angular project but does not have a ng-package.json file');
    }
    UpdateJsonFile(tree, (ngPackageJson: NgPackageJson) => {
      ngPackageJson.allowedNonPeerDependencies ??= [];
      CoerceArrayItems(ngPackageJson.allowedNonPeerDependencies, dependencyList);
    }, join(projectRoot, 'ng-package.json'));
  }

  return {
    addedPackageList,
    changedPackageList,
    removedPackageList,
    unknownPackageList,
  };

}

const PACKAGE_VERSION_MAP: Record<string, Record<string, string>> = {};

async function parseJsonFile<T = Record<string, unknown>>(tree: Tree, path: string, retries = 3, sleep = 3000): Promise<T> {
  if (!tree.exists(path)) {
    throw new Error(`Cannot parse json object. File ${ path } not found`);
  }
  let retryCount = 0;
  let lastError: Error | undefined;
  do {
    try {
      const content = tree.read(path)!.toString('utf-8');
      return JSON.parse(content);
    } catch (e: any) {
      lastError = e;
      retryCount++;
      if (retryCount < retries) {
        await new Promise(resolve => setTimeout(resolve, sleep * retryCount));
      }
    }
  } while (retryCount < retries);
  throw new Error(`Failed to parse json file ${ path }: ${ lastError?.message }`);
}

async function loadAvailablePackageVersion(tree: Tree, projectRoot: string) {
  PACKAGE_VERSION_MAP[projectRoot] = {};

  function updateMap(dependencies: Record<string, string> | undefined): void {
    for (const [ packageName, version ] of Object.entries(dependencies ?? {})) {
      if (version !== '*' && !HasProjectWithPackageName(packageName)) {
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
      const packageJson: ProjectPackageJson = await parseJsonFile(tree, join(workingDirectory, 'package.json'));
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

function findBasePackageVersion(packageName: string, projectRoot: string): string {
  if (!PACKAGE_VERSION_MAP[projectRoot]) {
    throw new Error('Package version map not loaded. Ensure the loadAvailablePackageVersion function is called before.');
  }
  if (PACKAGE_VERSION_MAP[projectRoot][packageName]) {
    return PACKAGE_VERSION_MAP[projectRoot][packageName];
  }
  return 'latest';
}

function printReport(
  projectName: string,
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
  console.log(`====================  Report for project ${ projectName }`);
  console.log('========== Peer dependencies:');
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

function skipProject(tree: Tree, options: SkipProjectOptions, project: ProjectConfiguration, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonPublishableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;
}

const RESOLVED_PACKAGE_VERSION_MAP: Record<string, string> = {};

export async function resolveLatestPackageVersion(packageName: string) {
  if (RESOLVED_PACKAGE_VERSION_MAP[packageName]) {
    return RESOLVED_PACKAGE_VERSION_MAP[packageName];
  }
  const latestVersion = await GetLatestPackageVersion(packageName);
  if (latestVersion) {
    RESOLVED_PACKAGE_VERSION_MAP[packageName] = latestVersion;
  }
  return latestVersion;
}

export async function replaceLatestPackageVersionForProject(tree: Tree, projectName: string) {
  console.log(`Replace latest package version for project ${ projectName }`);
  const projectRoot = GetProjectRoot(tree, projectName);
  const packageJson = await parseJsonFile<ProjectPackageJson>(tree, join(projectRoot, 'package.json'));
  const dependencies = packageJson.dependencies;
  const peerDependencies = packageJson.peerDependencies;
  const devDependencies = packageJson.devDependencies;
  const optionalDependencies = packageJson.optionalDependencies;

  async function replaceLatestPackageVersion(dependencies: Record<string, string> | undefined): Promise<void> {
    for (const [ packageName, version ] of Object.entries(dependencies ?? {})) {
      if (version === 'latest') {
        const resolvedVersion = await resolveLatestPackageVersion(packageName);
        if (resolvedVersion !== 'latest' && resolvedVersion) {
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

  CoerceFile(tree, join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n', true);
}

export function removePackageFromDependencies(packageName: string, dependencies: Dependency | undefined) {
  if (dependencies?.[packageName]) {
    delete dependencies[packageName];
  }
}

export function removeSelfReferenceFromDependencies(projectName: string, {
  dependencies,
  peerDependencies,
  devDependencies,
  optionalDependencies,
}: ProjectPackageJson) {
  const packageName = ProjectNameToPackageName(projectName);
  removePackageFromDependencies(packageName, dependencies);
  removePackageFromDependencies(packageName, peerDependencies);
  removePackageFromDependencies(packageName, devDependencies);
  removePackageFromDependencies(packageName, optionalDependencies);
}

function coerceTsLib(latestTsLibVersion: string | null, packageJson: PackageJson) {
  packageJson.dependencies ??= {};
  if (latestTsLibVersion && !packageJson.dependencies['tslib']) {
    packageJson.dependencies['tslib'] = latestTsLibVersion;
  }
}

function preferPackageAsPeerDependency(packageJson: PackageJson) {
  packageJson.dependencies ??= {};
  packageJson.peerDependencies ??= {};
  for (const [name] of Object.entries(packageJson.dependencies)) {
    if (packageJson.peerDependencies[name]) {
      delete packageJson.dependencies[name];
    }
  }
}

function removeBannedPeerDependencies(packageJson: PackageJson) {
  packageJson.peerDependencies ??= {};
  for (const banned of PACKAGE_PEER_DEPENDENCIES_BLACK_LIST) {
    if (packageJson.peerDependencies[banned]) {
      delete packageJson.peerDependencies[banned];
    }
  }
}

function forceAllDependenciesAsDependencies(packageJson: PackageJson) {
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };
  packageJson.peerDependencies = {};
}

function setDependencyVersionFromRootPackageJson(packageJson: PackageJson, rootPackageJson: PackageJson) {
  packageJson.dependencies ??= {};
  for (const [packageName, version] of Object.entries(packageJson.dependencies)) {
    packageJson.dependencies[packageName] = rootPackageJson.dependencies?.[packageName] ?? rootPackageJson.devDependencies?.[packageName] ?? version;
  }
}

function forcePeerDependencies(packageJson: PackageJson) {
  packageJson.peerDependencies ??= {};
  packageJson.dependencies ??= {};
  for (const forcedPeerDependency of PACKAGE_FORCED_PEER_DEPENDENCIES) {
    for (const [packageName, version] of Object.entries(packageJson.dependencies)) {
      if (forcedPeerDependency instanceof RegExp ? forcedPeerDependency.test(packageName) : forcedPeerDependency === packageName) {
        packageJson.peerDependencies[packageName] = version;
        delete packageJson.dependencies[packageName];
      }
    }
  }
}

function forcePackagesAsDependencies(tree: Tree, packageJson: PackageJson, packages: string[], projectRoot: string) {
  packageJson.dependencies ??= {};
  packageJson.peerDependencies ??= {};
  for (const packageName of Object.keys(packageJson.peerDependencies)) {
    if (packages.includes(packageName)) {
      packageJson.dependencies[packageName] = packageJson.peerDependencies[packageName];
      delete packageJson.peerDependencies[packageName];
    }
  }
  for (const packageName of packages) {
    if (!packageJson.dependencies[packageName]) {
      if (HasProjectWithPackageName(packageName)) {
        packageJson.dependencies[packageName] = getProjectPackageVersion(tree, PackageNameToProjectName(packageName));
      } else {
        packageJson.dependencies[packageName] = findBasePackageVersion(packageName, projectRoot);
      }
    }
  }
}

function forcePackagesAsPeerDependencies(tree: Tree, packageJson: PackageJson, packages: string[], projectRoot: string) {
  packageJson.dependencies ??= {};
  packageJson.peerDependencies ??= {};
  for (const packageName of Object.keys(packageJson.dependencies)) {
    if (packages.includes(packageName)) {
      packageJson.peerDependencies[packageName] = packageJson.dependencies[packageName];
      delete packageJson.dependencies[packageName];
    }
  }
  for (const packageName of packages) {
    if (!packageJson.peerDependencies[packageName]) {
      if (HasProjectWithPackageName(packageName)) {
        packageJson.peerDependencies[packageName] = getProjectPackageVersion(tree, PackageNameToProjectName(packageName));
      } else {
        packageJson.peerDependencies[packageName] = findBasePackageVersion(packageName, projectRoot);
      }
    }
  }
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
  console.log('Fix dependencies');

  if (!options.verbose) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.debug = () => {
    };
  }

  if (options.reset || options.resetAll) {
    console.log('Reset dependencies');
    for (const [ projectName, project ] of getProjects(tree).entries()) {
      const projectRoot = project.root;
      if (skipProject(tree, options, project, projectName)) {
        continue;
      }
      const packageJson = await parseJsonFile(tree, `${ projectRoot }/package.json`);
      if (options.resetAll) {
        packageJson.dependencies = {};
      }
      packageJson.peerDependencies = {};
      packageJson.devDependencies = {};
      packageJson.optionalDependencies = {};
      CoerceFile(tree, `${ projectRoot }/package.json`, JSON.stringify(packageJson, null, 2) + '\n', true);
    }
  }

  const rootPackageJson = GetRootPackageJson(tree);
  console.log('Root package.json loaded');

  const projectGraph = await createProjectGraphAsync();
  console.log('Project graph created');
  LoadProjectToPackageMapping(tree, projectGraph);

  const unknownPackageMap: Record<string, string[]> = {};
  const latestTsLibVersion = await resolveLatestPackageVersion('tslib');

  console.log('Start fixing dependencies');
  for (const [ projectName, project ] of getProjects(tree).entries()) {

    const projectRoot = project.root;
    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`Fix dependencies for project ${ projectName }`);

    await loadAvailablePackageVersion(tree, projectRoot);

    UpdatePackageJson(tree, packageJson => {

      packageJson.dependencies ??= {};
      packageJson.peerDependencies ??= {};
      packageJson.devDependencies ??= {};
      packageJson.optionalDependencies ??= {};

      preferPackageAsPeerDependency(packageJson);

      coerceTsLib(latestTsLibVersion, packageJson);

      const peerReport = fixDependenciesWithTsMorphProject(project, tree, projectRoot, packageJson);

      removeSelfReferenceFromDependencies(projectName, packageJson);

      removeBannedPeerDependencies(packageJson);

      if (options.onlyDependencies) {
        forceAllDependenciesAsDependencies(packageJson);
      }

      if (options.dependencies?.length) {
        forcePackagesAsDependencies(tree, packageJson, options.dependencies, projectRoot);
      }

      if (options.peerDependencies?.length) {
        forcePackagesAsPeerDependencies(tree, packageJson, options.peerDependencies, projectRoot);
      }

      setDependencyVersionFromRootPackageJson(packageJson, rootPackageJson);

      forcePeerDependencies(packageJson);

      printReport(projectName, peerReport);

      unknownPackageMap[projectName] = peerReport.unknownPackageList.filter((packageName, index, self) => self.indexOf(
        packageName) === index);

    }, { basePath: projectRoot });

  }
  console.log('Finished fixing dependencies');

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
