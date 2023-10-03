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
  Assets,
  CoerceAssets,
  CoerceFile,
  CoerceIgnorePattern,
  IsBuildable,
  IsPublishable,
  RemoveAssets,
  SkipNonLibraryProject,
} from '@rxap/generator-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
  DeleteRecursive,
  IsRxapRepository,
  SearchFile,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import {
  gte,
  parse,
} from 'semver';
import { SkipNonAngularProject } from '../../lib/skip-project';
import { InitGeneratorSchema } from '../init/schema';
import { InitLibraryGeneratorSchema } from './schema';

function hasIndexScss(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.sourceRoot, '_index.scss'));
}

interface NgPackageJson {
  assets: Assets;
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

function hasTailwindConfig(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.root, 'tailwind.config.js'));
}

function updateProjectNgPackageConfiguration(tree: Tree, project: ProjectConfiguration) {
  const ngPackageJson = readNgPackageJson(tree, project);

  ngPackageJson.assets ??= [];

  CoerceAssets(ngPackageJson.assets, [ 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE.md' ]);

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

  const assetStyles = 'theme.css';

  if (hasIndexScss(tree, project)) {
    CoerceAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  } else {
    RemoveAssets(ngPackageJson.assets, [ assetThemes, assetIndex ]);
  }

  if (hasTailwindConfig(tree, project)) {
    CoerceAssets(ngPackageJson.assets, [ assetStyles ]);
  } else {
    RemoveAssets(ngPackageJson.assets, [ assetStyles ]);
  }

  writeNgPackageJson(tree, project, ngPackageJson);
}

function coerceTailwindThemeScss(tree: Tree, project: ProjectConfiguration) {
  const themeScssPath = join(project.sourceRoot, 'styles/theme.scss');
  if (hasTailwindConfig(tree, project)) {
    if (!tree.exists(themeScssPath)) {
      tree.write(themeScssPath, '@tailwind components;\n@tailwind utilities;');
    }
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'theme.css' ]);
  } else {
    if (tree.exists(themeScssPath)) {
      tree.delete(themeScssPath);
    }
  }
}

function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function extendAngularSpecificEslint(tree: Tree, project: ProjectConfiguration) {

  if (!IsRxapRepository(tree)) {
    return;
  }

  const projectRoot = project.root;

  const relativeToAngularRoot = relative(projectRoot, 'packages/angular');

  const extendsPath = relativeToAngularRoot + '/.eslintrc.json';

  const eslintConfigFilaPath = `${ projectRoot }/.eslintrc.json`;
  const defaultEslintConfig = {
    extends: [ extendsPath ],
    ignorePatterns: [ '!**/*' ],
    overrides: [],
  };
  CoerceFile(tree, eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));

  const eslintConfig = JSON.parse(tree.read(eslintConfigFilaPath).toString('utf-8'));

  if (eslintConfig.extends[0] !== extendsPath) {
    tree.write(eslintConfigFilaPath, JSON.stringify(defaultEslintConfig, null, 2));
  }

}

function updateProjectTargets(tree: Tree, project: ProjectConfiguration) {

  if (IsPublishable(tree, project)) {

    CoerceTarget(project, 'check-version', {
      executor: '@rxap/plugin-library:check-version',
      options: {
        packageName: '@angular/core',
      },
    });

    if (hasTailwindConfig(tree, project)) {
      CoerceTarget(project, 'build-tailwind', {
        executor: '@rxap/plugin-angular:tailwind',
        configurations: {
          production: {
            minify: true,
          },
          development: {},
        },
      });
    } else {
      if (project.targets['build-tailwind']) {
        delete project.targets['build-tailwind'];
      }
    }

    if (isNgPackagrProject(tree, project)) {
      CoerceTarget(project, 'check-ng-package', { executor: '@rxap/plugin-angular:check-ng-package' });
    }

  }

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version', 'build-tailwind', 'check-ng-package');
  CoerceTargetDefaultsDependency(nxJson, 'build-tailwind', {
    target: 'build',
    projects: [
      'browser-tailwind',
    ],
  });
  CoerceTargetDefaultsOutput(nxJson, 'build-tailwind', '{projectRoot}/theme.css');
  CoerceTargetDefaultsInput(
    nxJson,
    'build-tailwind',
    '{projectRoot}/**/*.html',
    '{projectRoot}/**/*.scss',
    '{projectRoot}/**/*.css',
  );
  CoerceTargetDefaultsInput(
    nxJson,
    'check-ng-package',
    '{projectRoot}/ng-package.json',
    '{projectRoot}/package.json',
  );

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'build-tailwind', 'check-ng-package', 'copy-client-sdk');

  updateNxJson(tree, nxJson);
}

function isNgPackagrProject(tree: Tree, project: ProjectConfiguration) {
  return tree.exists(join(project.root, 'ng-package.json'));
}

function checkIfSecondaryEntrypointIncludeInTheTsConfig(tree: Tree, project: ProjectConfiguration) {
  const projectRoot = project.root;
  const libTsConfigPath = join(projectRoot, 'tsconfig.lib.json');
  const specTsConfigPath = join(projectRoot, 'tsconfig.spec.json');
  const libTsConfig = tree.exists(libTsConfigPath) ? JSON.parse(tree.read(libTsConfigPath).toString('utf-8')) : null;
  const specTsConfig = tree.exists(specTsConfigPath) ? JSON.parse(tree.read(specTsConfigPath).toString('utf-8')) : null;
  for (const { path } of SearchFile(tree, projectRoot)) {
    if (!path.endsWith('ng-package.json')) {
      continue;
    }
    const folder = dirname(path);
    const entryPoint = relative(projectRoot, folder);
    if (entryPoint) {
      if (libTsConfig) {
        libTsConfig.include ??= [];
        if (!libTsConfig.include.includes(`${ entryPoint }/**/*.ts`)) {
          libTsConfig.include.push(`${ entryPoint }/**/*.ts`);
        }
      }
      if (specTsConfig) {
        specTsConfig.include ??= [];
        if (!specTsConfig.include.includes(`${ entryPoint }/**/*.spec.ts`)) {
          specTsConfig.include.push(`${ entryPoint }/**/*.spec.ts`);
        }
      }
    }
  }
  if (libTsConfig) {
    tree.write(libTsConfigPath, JSON.stringify(libTsConfig, null, 2) + '\n');
  }
  if (specTsConfig) {
    tree.write(specTsConfigPath, JSON.stringify(specTsConfig, null, 2) + '\n');
  }
}

function cleanup(tree: Tree, project: ProjectConfiguration, projectName: string) {
  const projectSourceRoot = project.sourceRoot;
  if (tree.exists(join(projectSourceRoot, 'lib', projectName))) {
    DeleteRecursive(tree, join(projectSourceRoot, 'lib', projectName));
    tree.write(join(projectSourceRoot, 'index.ts'), 'export {};');
  }
}

function getAngularMajorVersion(rootPackageJson: ProjectPackageJson): string | null {
  let targetVersion = rootPackageJson.dependencies['@angular/core'] ?? rootPackageJson.devDependencies['@angular/cli'];

  if (!targetVersion) {
    console.error(`The package @angular/core and @angular/cli are not installed in the root package.json`);
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
    const version = getAngularMajorVersion(rootPackageJson) ?? packageJson.version;
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
  console.log('angular library init generator:', options);

  setGeneralTargetDefaults(tree);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init project: ${ projectName }`);

      cleanup(tree, project, projectName);
      updatePackageJson(tree, project, rootPackageJson);

      checkIfSecondaryEntrypointIncludeInTheTsConfig(tree, project);

      if (IsBuildable(project)) {
        updateProjectNgPackageConfiguration(tree, project);
        coerceTailwindThemeScss(tree, project);
      }
      extendAngularSpecificEslint(tree, project);
      updateProjectTargets(tree, project);

      updateProjectConfiguration(tree, project.name, project);

    }

  }

}

export default initLibraryGenerator;
