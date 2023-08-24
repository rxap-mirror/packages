import {
  generateFiles,
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
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { InitGeneratorSchema } from '../init/schema';
import { InitPublishableGeneratorSchema } from './schema';

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

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

  updateNxJson(tree, nxJson);

}

function updateProjectPackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  projectName: string,
  rootPackageJson: ProjectPackageJson,
) {
  const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
  packageJson.scripts ??= {};
  if (Object.keys(packageJson.scripts).length === 0) {
    delete packageJson.scripts;
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

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project);
    updateProjectPackageJson(tree, project, projectName, rootPackageJson);
    generateFiles(tree, join(__dirname, 'files'), project.root, options);
    CoerceFile(tree, join(project.root, 'CHANGELOG.md'));
    CoerceFile(tree, join(project.root, 'GETSTARTED.md'));
    CoerceFile(tree, join(project.root, 'GUIDES.md'));
    CoerceFile(tree, join(project.root, 'LICENSE.md'), tree.read('LICENSE'));
    CoerceFile(tree, join(project.root, 'LICENSE'), tree.read('LICENSE'));
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'README.md' ]);

    updateProjectConfiguration(tree, project.name, project);

  }
}

export default initPublishableGenerator;
