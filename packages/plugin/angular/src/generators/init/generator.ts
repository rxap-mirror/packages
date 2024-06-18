import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import { DeleteProperties } from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  GenerateSerializedSchematicFile,
  GetNxVersion,
} from '@rxap/workspace-utilities';
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
    DeleteProperties(options, [ 'projects', 'overwrite', 'skipProjects' ]),
  );

  await AddPackageJsonDevDependency(tree, '@nx/angular', GetNxVersion(tree), { soft: true });

  coerceNxJson(tree, options);

  await initLibraryGenerator(tree, {
    projects: [
      'components',
      'forms',
      'controls',
      'tables'
    ],
    coerce: {
      directory: 'angular',
      addTailwind: true,
      buildable: true,
    }
  });

  await initLibraryGenerator(tree, {
    projects: [
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
    ],
    coerce: {
      directory: 'angular',
      buildable: true,
    }
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
