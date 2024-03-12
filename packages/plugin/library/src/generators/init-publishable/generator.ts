import {
  getProjects,
  ProjectConfiguration,
  readJson,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import {
  CoerceFile,
  CoerceIgnorePattern,
  GetBuildOutputForProject,
  SkipNonPublishableProject,
} from '@rxap/generator-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import {
  CoerceFilesStructure,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
  GetWorkspaceScope,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { InitGeneratorSchema } from '../init/schema';
import { InitPublishableGeneratorSchema } from './schema';

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'readme');
  CoerceTargetDefaultsDependency(nxJson, 'fix-dependencies', '^fix-dependencies');

  CoerceTargetDefaultsInput(
    nxJson,
    'readme',
    '{projectRoot}/README.md.handlebars',
    '{projectRoot}/GETSTARTED.md',
    '{projectRoot}/GUIDES.md',
    '{projectRoot}/package.json',
    '{projectRoot}/collection.json',
    '{projectRoot}/generators.json',
    '{projectRoot}/executors.json',
    '{projectRoot}/builders.json',
  );
  CoerceTargetDefaultsOutput(nxJson, 'readme', '{projectRoot}/README.md');

  CoerceNxJsonCacheableOperation(nxJson, 'readme');

  CoerceTarget(nxJson, 'linking', {
    executor: '@rxap/plugin-library:node-modules-linking',
    dependsOn: [
      'build',
      '^linking',
    ],
    inputs: [
      {
        env: 'CI_JOB_ID',
      },
    ],
  });

  updateNxJson(tree, nxJson);

}

function updateProjectPackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  projectName: string,
  rootPackageJson: ProjectPackageJson,
) {
  const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
  const scope = GetWorkspaceScope(tree);
  packageJson.scripts ??= {};
  if (Object.keys(packageJson.scripts).length === 0) {
    delete packageJson.scripts;
  }
  if (packageJson.name && !packageJson.name.startsWith('@')) {
    const newName = `${ scope }/${ projectName }`;
    updatePathsAliasInBaseTsConfig(tree, project, packageJson.name, newName);
    packageJson.name = newName;
  }
  packageJson.publishConfig ??= {};
  packageJson.publishConfig.access = 'public';
  const output = GetBuildOutputForProject(project);
  packageJson.publishConfig.directory = relative(project.root, output);

  // add common properties
  packageJson.keywords = [
    ...new Set([
      ...(packageJson.keywords ?? []),
      ...(rootPackageJson.keywords ?? []),
      ...(project.tags ?? []),
      projectName,
    ]),
  ];
  if (rootPackageJson.homepage) {
    packageJson.homepage = join(rootPackageJson.homepage, project.root);
  }
  packageJson.bugs = rootPackageJson.bugs;
  packageJson.license = rootPackageJson.license;
  packageJson.contributors = rootPackageJson.contributors;
  packageJson.funding = rootPackageJson.funding;
  packageJson.repository = rootPackageJson.repository;
  if (packageJson.repository && typeof packageJson.repository === 'object') {
    packageJson.repository.directory = project.root;
  }
  packageJson.author = rootPackageJson.author;
  writeJson(tree, join(project.root, 'package.json'), packageJson);
}

function updatePathsAliasInBaseTsConfig(
  tree: Tree,
  project: ProjectConfiguration,
  currentPackageJsonName: string,
  newPackageJsonName: string
) {
  const tsConfig = readJson(tree, join('/', 'tsconfig.base.json'));
  if (tsConfig.compilerOptions.paths[currentPackageJsonName]) {
    const aliasList = tsConfig.compilerOptions.paths[currentPackageJsonName];
    delete tsConfig.compilerOptions.paths[currentPackageJsonName];
    tsConfig.compilerOptions.paths[newPackageJsonName] = aliasList;
  }
  writeJson(tree, join('/', 'tsconfig.base.json'), tsConfig);
}

function updateProjectTargets(project: ProjectConfiguration) {
  CoerceTarget(project, 'update-dependencies', { executor: '@rxap/plugin-library:update-dependencies' });
  CoerceTarget(project, 'update-package-group', { executor: '@rxap/plugin-library:update-package-group' });
  CoerceTarget(project, 'readme', { executor: '@rxap/plugin-library:readme' });
  CoerceTarget(project, 'fix-dependencies', {
    executor: '@rxap/plugin-library:run-generator',
    outputs: [
      '{workspaceRoot}/{projectRoot}/package.json',
    ],
    options: {
      generator: '@rxap/plugin-library:fix-dependencies',
      options: {
        strict: true,
      },
    },
  });
  CoerceTarget(project, 'linking', {});
}

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonPublishableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initPublishableGenerator(
  tree: Tree,
  options: InitPublishableGeneratorSchema,
) {
  console.log('publishable library init generator:', options);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  setGeneralTargetDefaults(tree);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init project: ${ projectName }`);

      updateProjectTargets(project);
      updateProjectPackageJson(tree, project, projectName, rootPackageJson);
      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files'),
        target: project.root,
        overwrite: options.overwrite,
      });
      CoerceFile(tree, join(project.root, 'CHANGELOG.md'));
      CoerceFile(tree, join(project.root, 'GETSTARTED.md'));
      CoerceFile(tree, join(project.root, 'GUIDES.md'));
      if (tree.exists('LICENSE')) {
        CoerceFile(tree, join(project.root, 'LICENSE.md'), tree.read('LICENSE')!);
        CoerceFile(tree, join(project.root, 'LICENSE'), tree.read('LICENSE')!);
      } else {
        console.warn('no LICENSE file found in the workspace root');
      }
      CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'README.md' ]);

      updateProjectConfiguration(tree, projectName, project);

    }

  }

}

export default initPublishableGenerator;
