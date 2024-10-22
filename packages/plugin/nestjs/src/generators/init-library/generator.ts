import {
  formatFiles,
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
  LibraryInitProject,
  LibraryInitWorkspace,
} from '@rxap/plugin-library';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  GetTarget,
  GetTargetOptions,
  IsPublishable,
  SkipNonLibraryProject,
  Strategy,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  gte,
  parse,
} from 'semver';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import { InitLibraryGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (options.project === projectName) {
    return false;
  }

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

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version');

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'copy-client-sdk');

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(tree: Tree, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  if (IsPublishable(tree, project)) {
    CoerceTarget(project, 'check-version', {
      executor: '@rxap/plugin-library:check-version',
      options: {
        packageName: '@nestjs/core',
      },
    });
    const buildTarget = GetTarget(project, 'build');
    const buildOptions = GetTargetOptions(buildTarget);
    const tsConfigPath = (buildOptions.tsConfig ?? join(project.root, 'tsconfig.lib.json')) as string;
    const prodTsConfigPath = tsConfigPath.replace('tsconfig.lib.json', 'tsconfig.lib.prod.json');
    CoerceTarget(project, 'build', {
      configurations: {
        production: {
          tsConfig: prodTsConfigPath,
        },
        development: {}
      },
      defaultConfiguration: 'development',
    }, Strategy.OVERWRITE);
  }

  if (options.targets?.fixDependencies !== false) {
    CoerceTarget(project, 'fix-dependencies', {
      options: {
        options: {
          strict: true,
          onlyDependencies: false,
        },
      },
    }, Strategy.OVERWRITE);
  }

}

function getNestMajorVersion(rootPackageJson: ProjectPackageJson): number {
  let targetVersion = rootPackageJson.dependencies?.['@nestjs/core'] ?? rootPackageJson.devDependencies?.['@nestjs/cli'];

  if (!targetVersion) {
    throw new Error(`The package @nestjs/core and @nestjs/cli are not installed in the root package.json`);
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Can't parse version: ${ targetVersion }`);
  }

  return version.major;
}

function updatePackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  rootPackageJson: ProjectPackageJson,
) {
  if (IsPublishable(tree, project) && tree.exists(join(project.root, 'package.json'))) {
    const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
    const nestMajorVersion = getNestMajorVersion(rootPackageJson) ?? packageJson.version;
    const version = `${ nestMajorVersion }.0.0-dev.0`;
    if (!version) {
      throw new Error('Can\'t determine the nest major version');
    }
    if (!packageJson.version || gte(version, packageJson.version)) {
      packageJson.version = version;
    }
    writeJson(tree, join(project.root, 'package.json'), packageJson);
  }
}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('nestjs library init generator:', options);

  LibraryInitWorkspace(tree, options);

  setGeneralTargetDefaults(tree);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-nestjs',
        'init-library',
        DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
      );

      console.log(`init nestjs library project: ${ projectName }`);

      await LibraryInitProject(tree, projectName, project, options);

      updateProjectTargets(tree, project, options);
      updatePackageJson(tree, project, rootPackageJson);

      if (IsPublishable(tree, project)) {
        UpdateTsConfigJson(tree, tsConfig => {
          tsConfig.extends = './tsconfig.lib.json';
          tsConfig.compilerOptions = {
            sourceMap: false
          };
        }, { create: true, infix: 'lib.prod', basePath: project.root });
      }

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
