import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import libraryGenerator from '@nx/js/src/generators/library/library';
import {
  CoerceIgnorePattern,
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
import { wrapAngularDevkitSchematic } from 'nx/src/adapter/ngcli-adapter';
import { join } from 'path';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import swaggerGenerator from '../swagger/generator';
import { InitApplicationGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'generate-package-json');
  CoerceTargetDefaultsDependency(nxJson, 'generate-open-api', 'swagger-generate');

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(project: ProjectConfiguration) {

  CoerceTarget(project, 'generate-package-json', {
    executor: '@rxap/plugin-nestjs:package-json',
    configurations: {
      production: {},
    },
  });

  const outputPath = project.targets?.build?.options?.outputPath;

  if (!outputPath) {
    throw new Error(`No outputPath found for project ${ project.name }`);
  }

  CoerceTarget(project, 'generate-open-api', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/schematics-open-api:generate',
      options: {
        project: `open-api-${ project.name }`,
        path: `${ outputPath.replace('dist/', 'dist/swagger/') }/openapi.json`,
        serverId: project.name,
      },
    },
  });

}

function updateGitIgnore(tree: Tree, project: ProjectConfiguration) {
  CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'package.json' ]);
}

async function createOpenApiClientSdkLibrary(
  tree: Tree,
  project: ProjectConfiguration,
  projects: Map<string, ProjectConfiguration>,
) {

  const openApiProjectName = `open-api-${ project.name }`;

  if (projects.has(openApiProjectName)) {
    return;
  }

  const projectRoot = project.root;
  const fragments = projectRoot.split('/');
  const name = fragments.pop();
  fragments.shift(); // remove the root folder
  const directory = `open-api/${ fragments.join('/') }`;

  await libraryGenerator(tree, {
    name,
    directory,
    unitTestRunner: 'none',
    tags: 'open-api',
    buildable: false,
    bundler: 'none',
  });

  let tsConfig: any;

  try {
    tsConfig = JSON.parse(tree.read('tsconfig.base.json').toString('utf-8'));
  } catch (e: any) {
    throw new Error(`Can't parse tsconfig.base.json: ${ e.message }`);
  }

  projects = getProjects(tree);

  if (!projects.has(openApiProjectName)) {
    throw new Error(`Can't find project ${ openApiProjectName }`);
  }

  const openApiProjectRoot = projects.get(openApiProjectName)!.root;

  delete tsConfig.compilerOptions.paths[`${ directory }/${ name }`];
  tsConfig.compilerOptions.paths[`${ openApiProjectName }/*`] = [ `${ openApiProjectRoot }/src/lib/*` ];
  tree.write('tsconfig.base.json', JSON.stringify(tsConfig, null, 2));

  tree.write(`${ openApiProjectRoot }/src/index.ts`, 'export {};');
  tree.delete(`${ openApiProjectRoot }/src/lib/${ openApiProjectName }.ts`);
  tree.delete(`${ openApiProjectRoot }/README.md`);

}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  console.log('nestjs application init generator:', options);

  setGeneralTargetDefaults(tree);

  const projects = getProjects(tree);

  for (const [ projectName, project ] of projects.entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project);
    updateGitIgnore(tree, project);
    await createOpenApiClientSdkLibrary(tree, project, projects);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    if (options.swagger !== false) {
      await swaggerGenerator(tree, { project: projectName });
    }

    if (options.legacy) {
      await wrapAngularDevkitSchematic(
        '@rxap/schematic-nestjs',
        'init',
      )(tree, {
        ...options,
        swagger: false,
        project: projectName,
      });
    }

  }
}

export default initApplicationGenerator;
