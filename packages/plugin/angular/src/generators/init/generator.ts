import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import { DeleteProperties } from '@rxap/utilities';
import { GenerateSerializedSchematicFile } from '@rxap/workspace-utilities';
import initLibraryGenerator from '../init-library/generator';
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
    },
    indexExport: false,
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
      directory: 'angular'
    },
    indexExport: false,
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
