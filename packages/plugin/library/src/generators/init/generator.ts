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
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import {
  join,
  relative,
} from 'path';
import { InitGeneratorSchema } from './schema';


function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);
  nxJson.targetDefaults ??= {};

  // region build
  nxJson.targetDefaults['build'] ??= { dependsOn: [ '^build' ] };
  if (
    !nxJson.targetDefaults['build']
      .dependsOn
      .find(dependsOn => typeof dependsOn === 'object' && dependsOn.target === 'readme')
  ) {
    nxJson.targetDefaults['build']
      .dependsOn
      .push({
        target: 'readme',
        projects: 'self',
      });
  }
  // endregion

  // region readme
  nxJson.targetDefaults['readme'] ??= {};
  nxJson.targetDefaults['readme'].inputs = [
    '{projectRoot}/README.md.handlebars',
    '{projectRoot}/GETSTARTED.md',
    '{projectRoot}/GUIDES.md',
    '{projectRoot}/package.json',
    '{projectRoot}/collection.json',
    '{projectRoot}/generators.json',
    '{projectRoot}/executors.json',
    '{projectRoot}/builders.json',
  ];
  nxJson.targetDefaults['readme'].outputs = [ '{projectRoot}/README.md' ];
  // endregion

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
  if (packageJson.scripts.prepublishOnly) {
    delete packageJson.scripts.prepublishOnly;
  }
  if (packageJson.scripts.preversion) {
    delete packageJson.scripts.preversion;
  }
  if (packageJson.scripts.version) {
    delete packageJson.scripts.version;
  }
  if (Object.keys(packageJson.scripts).length === 0) {
    delete packageJson.scripts;
  }
  packageJson.publishConfig ??= {};
  packageJson.publishConfig.access = 'public';
  const output = GetBuildOutputForProject(project, tree.root);
  packageJson.publishConfig.directory = relative(join(tree.root, project.root), output);

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
  project.targets ??= {};
  project.targets['update-dependencies'] ??= { executor: '@rxap/plugin-library:update-dependencies' };
  project.targets['update-package-group'] ??= { executor: '@rxap/plugin-library:update-package-group' };
  project.targets['readme'] ??= { executor: '@rxap/plugin-library:readme' };
  project.targets['fix-dependencies'] ??= {
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
  };
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

  }

}

export default initGenerator;
