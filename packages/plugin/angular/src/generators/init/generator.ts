import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  GenerateSerializedSchematicFile,
  GetNxVersion,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import initLibraryGenerator from '../init-library/generator';
import { coerceNxJson } from './coerce-nx-json';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('angular init generator:', options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-angular',
    'init',
    options,
  );

  await AddPackageJsonDevDependency(tree, '@nx/angular', GetNxVersion(tree), { soft: true });

  coerceNxJson(tree, options);

  for (const projectName of [
    'components',
    'forms',
    'controls',
    'tables'
  ]) {
    await initLibraryGenerator(tree, {
      project: 'angular-' + projectName,
      coerce: {
        directory: join('angular', projectName),
        addTailwind: true,
        buildable: true,
      }
    });
  }

  for (const projectName of [
    'methods',
    'data-sources',
    'pipes',
    'directives',
    'guards',
    'services',
    'application-providers',
    'testing',
    'resolvers',
    'http-interceptors',
  ]) {
    await initLibraryGenerator(tree, {
      project: 'angular-' + projectName,
      coerce: {
        directory: join('angular', projectName),
        buildable: true,
      }
    });
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
