import { Tree } from '@nx/devkit';
import initLibraryGenerator from '../init-library/generator';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('angular init generator:', options);

  await initLibraryGenerator(tree, {
    projects: [
      'components',
      'forms',
      'controls',
      'tables'
    ],
    coerce: {
      directory: 'angular',
      addTailwind: true
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
      'services'
    ],
    coerce: {
      directory: 'angular'
    },
    indexExport: false,
  });

}

export default initGenerator;
