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
  CoerceProjectTags,
  GetBuildOutputForProject,
  SkipNonLibraryProject,
} from '@rxap/generator-utilities';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { nestJsInitGenerator } from '@rxap/plugin-nestjs';
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
import initPluginGenerator from '../init-plugin/generator';
import { InitGeneratorSchema } from './schema';


function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', '^build');
  CoerceTargetDefaultsDependency(nxJson, 'build', 'readme');

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
    ]),
  ];
  packageJson.homepage = join(rootPackageJson.homepage, project.root);
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

function updateProjectTags(project: ProjectConfiguration) {
  const tags: string[] = project.root.split('/').filter(Boolean);
  tags.unshift(); // remove the first element this is libs or packages, etc.
  if (tags[0] === 'angular') {
    tags.push('ngx');
  }
  if (tags[0] === 'nest') {
    tags.push('nestjs');
  }
  CoerceProjectTags(project, tags);
}

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('library init generator:', options);

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
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'README.md' ]);
    updateProjectTags(project);

    updateProjectConfiguration(tree, project.name, project);

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree, { ...options, projects: [ projectName ] });
    }

    if (project.tags?.includes('plugin')) {
      await initPluginGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
        },
      );
    }

    if (project.tags?.includes('nest')) {
      await nestJsInitGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
        },
      );
    }

  }

}

export default initGenerator;
