import { EachDirSync } from '@rxap/node-utilities';
import { readFileSync } from 'fs';
import {
  join,
  relative,
} from 'path';
import {
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  TreeLike,
} from './tree';

export interface CoerceFilesStructureOptions {
  srcFolder: string;
  target: string;
  overwrite?: boolean;
}

export function CoerceFilesStructure(tree: TreeLike,
                                     {
                                       srcFolder,
                                       target,
                                       overwrite,
                                     }: CoerceFilesStructureOptions,
) {
  for (const file of EachDirSync(srcFolder)) {
    const filePath = relative(srcFolder, file);
    const fullFilePath = join(target, filePath);
    if (!tree.exists(fullFilePath) || overwrite) {
      if (IsSchematicTreeLike(tree)) {
        if (tree.exists(fullFilePath)) {
          tree.overwrite(fullFilePath, readFileSync(file));
        } else {
          tree.create(fullFilePath, readFileSync(file));
        }
      } else if (IsGeneratorTreeLike(tree)) {
        tree.write(fullFilePath, readFileSync(file));
      } else {
        throw new Error('Invalid tree type');
      }
    }
  }
}
