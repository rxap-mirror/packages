import {
  generateFiles,
  getProjects,
  NxJsonConfiguration,
  ProjectConfiguration,
  readJson,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { InitGeneratorSchema } from './schema';
import {
  join,
  relative,
} from 'path';
import {
  CoerceFile,
  CoerceIgnorePattern,
  VisitTree,
} from '@rxap/generator-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { cypressComponentConfiguration } from '@nx/angular/generators';

function getBuildOutputForProject(project: ProjectConfiguration, workspaceRoot: string) {
  if (!project.targets.build) {
    throw new Error(`The project ${ project.name } has no build target. Can not determine the build output path.`);
  }
  const outputs = project.targets.build.outputs;
  if (!outputs || !outputs.length) {
    throw new Error(`The project ${ project.name } has no build outputs. Can not determine the build output path.`);
  }
  const [ output ] = outputs;
  return output
    .replace('{workspaceRoot}', workspaceRoot)
    .replace('{projectRoot}', project.root)
    .replace(/\{options\.(.+)}/, (_, option) => project.targets.build.options[option]);
}

function setGeneralTargetDefaults(nxJson: NxJsonConfiguration) {
  nxJson.targetDefaults ??= {};

  // region build
  nxJson.targetDefaults['build'] ??= { dependsOn: [ '^build' ] };
  if (!nxJson.targetDefaults['build'].dependsOn
                                     .find(dependsOn => typeof dependsOn ===
                                       'object' &&
                                       dependsOn.target ===
                                       'readme')) {
    nxJson.targetDefaults['build'].dependsOn
                                  .push({
                                    target: 'readme',
                                    projects: 'self',
                                  });
  }
  if (!nxJson.targetDefaults['build'].dependsOn
                                     .find(dependsOn => typeof dependsOn ===
                                       'object' &&
                                       dependsOn.target ===
                                       'scss-bundle')) {
    nxJson.targetDefaults['build'].dependsOn
                                  .push({
                                    target: 'scss-bundle',
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

}

function updateProjectPackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  projectName: string,
  rootPackageJson: ProjectPackageJson,
) {
  const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
  packageJson.scripts ??= {};
  packageJson.scripts.version
    = `yarn run --top-level nx run-many --targets=update-dependencies,update-package-group --projects=${ projectName }`;
  packageJson.scripts.preversion = `nx g @rxap/plugin-library:fix-dependencies --strict --project ${ projectName }`;
  if (packageJson.scripts.prepublishOnly) {
    delete packageJson.scripts.prepublishOnly;
  }
  packageJson.publishConfig ??= {};
  packageJson.publishConfig.access = 'public';
  const output = getBuildOutputForProject(project, tree.root);
  packageJson.publishConfig.directory = relative(join(tree.root, project.root), output);

  // add common properties
  packageJson.keywords = [
    ...new Set([
      ...(
        packageJson.keywords ?? []
      ),
      ...(
        rootPackageJson.keywords ?? []
      ),
      ...(
        project.tags ?? []
      ),
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

function hasIndexScss(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.sourceRoot, '_index.scss'));
}

function updateProjectTargets(tree: Tree, project: ProjectConfiguration) {
  project.targets ??= {};
  project.targets['update-dependencies'] ??= { executor: '@rxap/plugin-library:update-dependencies' };
  project.targets['update-package-group'] ??= { executor: '@rxap/plugin-library:update-package-group' };
  project.targets['readme'] ??= { executor: '@rxap/plugin-library:readme' };
  updateProjectConfiguration(tree, project.name, project);
}

interface NgPackageJson {
  assets: Array<string | { input: string, glob: string, output: string }>;
}

function readNgPackageJson(tree: Tree, project: ProjectConfiguration): NgPackageJson {
  if (!tree.exists(join(project.root, 'ng-package.json'))) {
    throw new Error(`The project ${ project.name } has no ng-package.json file.`);
  }
  return readJson(tree, join(project.root, 'ng-package.json'));
}

function writeNgPackageJson(tree: Tree, project: ProjectConfiguration, ngPackageJson: NgPackageJson) {
  writeJson(tree, join(project.root, 'ng-package.json'), ngPackageJson);
}

function updateProjectNgPackageConfiguration(tree: Tree, project: ProjectConfiguration) {
  const ngPackageJson = readNgPackageJson(tree, project);

  ngPackageJson.assets = [
    'README.md', 'CHANGELOG.md',
  ];

  if (hasIndexScss(tree, project)) {
    const assetThemes = {
      input: '.',
      glob: '**/*.theme.scss',
      output: '.',
    };
    const assetIndex = {
      input: '.',
      glob: '_index.scss',
      output: '.',
    };
    for (const asset of [ assetThemes, assetIndex ]) {
      if (!ngPackageJson.assets.some(a => typeof a === 'object' && a.input === asset.input && a.glob === asset.glob)) {
        ngPackageJson.assets.push(asset);
      }
    }
  }

  writeNgPackageJson(tree, project, ngPackageJson);
}

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {
  if (options.projects?.length && !options.projects?.includes(projectName)) {
    return true;
  }
  if (project.projectType !== 'library') {
    return true;
  }
  if (project.tags?.includes('internal')) {
    return true;
  }
  if (!tree.exists(join(project.root, 'project.json'))) {
    console.warn(`The project ${ projectName } has no project.json file.`);
    return true;
  }
  if (!tree.exists(join(project.root, 'package.json'))) {
    console.warn(`The project ${ projectName } has no package.json file.`);
    return true;
  }
  return false;
}

function hasComponents(tree: Tree, projectRoot: string) {
  for (const {
    path,
    isFile
  } of VisitTree(tree, projectRoot)) {
    if (isFile && path.endsWith('.component.ts')) {
      return true;
    }
  }
  return false;
}

async function coerceCypressComponentTesting(tree: Tree, project: ProjectConfiguration, projectName: string) {

  if (!project.targets['component-test']) {
    await cypressComponentConfiguration(tree, {
      project: projectName,
      generateTests: true,
      skipFormat: false,
      buildTarget: 'angular:build:development',
    });
    const _project = readProjectConfiguration(tree, projectName);
    _project.targets['component-test'].configurations ??= {};
    _project.targets['component-test'].configurations.open ??= {};
    _project.targets['component-test'].configurations.open.watch = true;
    updateProjectConfiguration(
      tree,
      projectName,
      _project,
    );
    tree.write(
      join(
        project.root,
        'cypress.config.ts',
      ),
      `import { componentTestingPreset } from 'workspace';
import { defineConfig } from 'cypress';

export default defineConfig({
  component: componentTestingPreset(__filename),
});`,
    );
  }

  const _project = readProjectConfiguration(
    tree,
    projectName,
  );
  const cypressProjectName = _project.targets['component-test'].options.devServerTarget.split(':').shift();
  const cypressProject = readProjectConfiguration(
    tree,
    cypressProjectName,
  );
  cypressProject.implicitDependencies ??= [];
  if (!cypressProject.implicitDependencies.includes(projectName)) {
    cypressProject.implicitDependencies.push(projectName);
    updateProjectConfiguration(
      tree,
      cypressProjectName,
      cypressProject,
    );
  }

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');
  const nxJson = readNxJson(tree);
  const promiseList: Array<Promise<void>> = [];

  setGeneralTargetDefaults(nxJson);

  getProjects(tree).forEach((project, projectName) => {
    if (skipProject(tree, options, project, projectName)) {
      return;
    }
    updateProjectTargets(tree, project);
    updateProjectPackageJson(tree, project, projectName, rootPackageJson);
    if (project.tags?.includes('angular')) {
      updateProjectNgPackageConfiguration(tree, project);
    }
    generateFiles(tree, join(__dirname, 'files'), project.root, options);
    CoerceFile(tree, join(project.root, 'CHANGELOG.md'));
    CoerceFile(tree, join(project.root, 'GETSTARTED.md'));
    CoerceFile(tree, join(project.root, 'GUIDES.md'));
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'README.md' ]);
    if (hasComponents(tree, project.root)) {
      promiseList.push(coerceCypressComponentTesting(tree, project, projectName));
    }
  });

  updateNxJson(tree, nxJson);

  await Promise.all(promiseList);

}

export default initGenerator;
