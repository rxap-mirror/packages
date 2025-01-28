import { Tree } from '@nx/devkit';
import {
  CoerceNxPlugin,
  IsRxapRepository,
  UpdateNxJson,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  UpdateNxJson(tree, nxJson => {
    if (IsRxapRepository(tree)) {
      CoerceNxPlugin(nxJson, './packages/plugin/kraft/src/plugin.ts');
    } else {
      CoerceNxPlugin(nxJson, '@rxap/plugin-kraft/plugin');
    }
  });
}

export default initGenerator;
