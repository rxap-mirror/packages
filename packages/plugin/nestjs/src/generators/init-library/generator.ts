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
  IsPublishable,
  SkipNonLibraryProject,
} from '@rxap/generator-utilities';
import { LibraryInitGenerator } from '@rxap/plugin-library';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  gte,
  parse,
} from 'semver';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import { InitApplicationGeneratorSchema } from '../init-application/schema';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version');

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'copy-client-sdk');

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(tree: Tree, project: ProjectConfiguration) {

  if (IsPublishable(tree, project)) {
    CoerceTarget(project, 'check-version', {
      executor: '@rxap/plugin-library:check-version',
      options: {
        packageName: '@nestjs/core',
      },
    });
  }

}

function getNestMajorVersion(rootPackageJson: ProjectPackageJson): string | null {
  let targetVersion = rootPackageJson.dependencies['@nestjs/core'] ?? rootPackageJson.devDependencies['@nestjs/cli'];

  if (!targetVersion) {
    console.error(`The package @nestjs/core and @nestjs/cli are not installed in the root package.json`);
    return null;
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  return `${ version.major }.0.0`;
}

function updatePackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  rootPackageJson: ProjectPackageJson,
) {
  if (IsPublishable(tree, project) && tree.exists(join(project.root, 'package.json'))) {
    const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
    const version = getNestMajorVersion(rootPackageJson) ?? packageJson.version;
    if (!packageJson.version || gte(version, packageJson.version)) {
      packageJson.version = version;
    }
    writeJson(tree, join(project.root, 'package.json'), packageJson);
  }
}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  console.log('nestjs library init generator:', options);

  setGeneralTargetDefaults(tree);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init project: ${ projectName }`);

      await LibraryInitGenerator(tree, {
        ...options,
        projects: [ projectName ],
        skipProjects: false,
      });

      updateProjectTargets(tree, project);
      updatePackageJson(tree, project, rootPackageJson);


      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }

  } else {

    await LibraryInitGenerator(tree, {
      ...options,
      projects: [ ],
      skipProjects: true,
    });

  }
}

export default initLibraryGenerator;
