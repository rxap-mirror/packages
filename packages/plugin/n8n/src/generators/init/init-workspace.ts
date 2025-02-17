import { Tree } from '@nx/devkit';
import { LibraryInitWorkspace } from '@rxap/plugin-library';
import {
  CoerceNxPlugin,
  IsRxapRepository,
  UpdateNxJson,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  LibraryInitWorkspace(tree, options);
  UpdateNxJson(tree, nxJson => {
    if (IsRxapRepository(tree)) {
      CoerceNxPlugin(nxJson, './packages/plugin/n8n/src/plugin.ts');
    } else {
      CoerceNxPlugin(nxJson, '@rxap/plugin-n8n');
    }
  });
}
