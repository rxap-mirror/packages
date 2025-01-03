import {
  formatFiles,
  readJson,
  Tree,
} from '@nx/devkit';
import { classify } from '@rxap/utilities';
import {
  CoerceFile,
  CoerceFilesStructure,
  CoerceLernaJson,
  CoerceTargetDefaultsInput,
  GenerateSerializedSchematicFile,
  GetWorkspaceName,
  UpdateJsonFile,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { addPackageDependencies } from './add-package-dependencies';
import { coerceDevContainerConfig } from './coerce-dev-container-config';
import { coerceIgnorePattern } from './coerce-ignore-pattern';
import { coerceNxJson } from './coerce-nx-json';
import { coercePackageJson } from './coerce-package-json';
import { coercePackageJsonLicense } from './coerce-package-json-license';
import { coercePrettierConfig } from './coerce-prettier-config';
import { coerceRootPackageJsonScripts } from './coerce-root-package-json-scripts';
import { coerceToolsProject } from './coerce-tools-project';
import { coerceWorkspaceProject } from './coerce-workspace-project';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.license ??= !options.skipLicense ? 'gpl' : undefined;
  if (options.license === 'none') {
    options.skipLicense = true;
  }
  console.log('workspace init generator:', options);

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'general'),
    target: '',
    overwrite: options.overwrite,
  });

  UpdateJsonFile(tree, angularJson => {
    angularJson.version = 1;
    angularJson.projects ??= {};
  }, 'angular.json', { create: true });

  if (!options.skipLicense && options.license) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', options.license),
      target: '',
      overwrite: options.overwrite,
    });
  }

  await addPackageDependencies(tree);
  coerceIgnorePattern(tree);
  await coercePackageJson(tree, options);
  coerceWorkspaceProject(tree, options);
  coerceNxJson(tree, options);
  coerceDevContainerConfig(tree);
  coercePrettierConfig(tree);
  await coerceToolsProject(tree);
  coerceRootPackageJsonScripts(tree, options);
  if (!options.skipLicense) {
    await coercePackageJsonLicense(tree, options);
  }

  const readMeContent = tree.read('README.md', 'utf-8');
  if (readMeContent?.includes('href="https://nx.dev"')) {
    const title = classify(GetWorkspaceName(tree));
    CoerceFile(tree, 'README.md', `${title}\n${'='.repeat(title.length)}\n`, true);
  }

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-workspace',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
