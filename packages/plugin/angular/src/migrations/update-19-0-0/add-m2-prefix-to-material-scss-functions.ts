import { Tree } from '@nx/devkit';
import { VisitTree } from '@rxap/workspace-utilities';
import { migrateM2ThemingApiUsages } from './migration';

export default async function (tree: Tree) {

  const potentialThemes: Array<{ path: string, content: string }> = [];

  for (const {
    path,
    isFile
  } of VisitTree(tree, '/')) {
    if (isFile && path.endsWith('.scss')) {
      const content = tree.read(path)!.toString('utf-8');
      if (content.includes('@angular/material')) {
        potentialThemes.push({
          path,
          content,
        });
      }
    }
  }

  for (const theme of potentialThemes) {
    const migrated = migrateM2ThemingApiUsages(theme.content);

    if (migrated !== theme.content) {
      tree.write(theme.path, migrated);
    }
  }

}
