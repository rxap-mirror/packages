import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceNxPlugin,
  GetNxVersion,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import initLibraryGenerator from '../init-library/generator';
import { coerceNxJson } from './coerce-nx-json';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init angular workspace');

  const nxJson = readNxJson(tree)!;

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/angular/src/library.ts');
    CoerceNxPlugin(nxJson, './packages/plugin/angular/src/application.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-angular/library');
    CoerceNxPlugin(nxJson, '@rxap/plugin-angular/application');
  }

  updateNxJson(tree, nxJson);

  await AddPackageJsonDevDependency(tree, '@nx/angular', GetNxVersion(tree), { soft: true });

  coerceNxJson(tree, options);

  if (options.withSharedLibraries) {
    for (const projectName of [
      'components',
      'forms',
      'controls',
      'tables'
    ]) {
      await initLibraryGenerator(tree, {
        project: 'angular-' + projectName,
        targets: {
          indexExport: true,
        },
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
      'utilities',
      'shared',
      'testing',
      'resolvers',
      'http-interceptors',
      'bootstrap-hooks'
    ]) {
      await initLibraryGenerator(tree, {
        project: 'angular-' + projectName,
        targets: {
          indexExport: true,
        },
        coerce: {
          directory: join('angular', projectName),
          buildable: true,
        }
      });
    }
  }

}
