import { Tree } from '@nx/devkit';
import {
  CoerceArrayItems,
  equals,
} from '@rxap/utilities';
import { UpdateJsonFile } from '@rxap/workspace-utilities';

export function coercePrettierConfig(tree: Tree) {
  UpdateJsonFile(tree, prettierConfig => {
    prettierConfig.singleQuote = true;
    prettierConfig.overrides ??= [];
    CoerceArrayItems(prettierConfig.overrides, [
      {
        files: [
          '*.yml',
          '*.yaml',
        ],
        options: {
          singleQuote: false,
        },
      },
    ], (a, b) => equals(a.files, b.files));
  }, '.prettierrc', { create: true });
}
