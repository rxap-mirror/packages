import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceFile,
  GetDefaultGeneratorOptions,
  HasProject,
} from '@rxap/workspace-utilities';

export async function coerceToolsProject(tree: Tree) {

  if (!HasProject(tree, 'workspace-tools')) {
    // nx g @nx/js:library --name=workspace-tools --directory=tools --importPath=workspace-tools --projectNameAndRootFormat=as-provided
    const defaultOptions = GetDefaultGeneratorOptions(tree, '@nx/js:library');
    const tags = (defaultOptions.tags as string ?? '').split(',').map(tag => tag.trim()).filter(Boolean);
    CoerceArrayItems(tags, ['internal']);
    await libraryGenerator(tree, {
      ...defaultOptions,
      tags: tags.join(','),
      name: 'workspace-tools',
      directory: 'tools',
      importPath: 'workspace-tools',
      minimal: true,
    });
    // throw new Error('The workspace-tools project was created. Please run the generator again.');
    if (tree.exists('tools/src/lib/workspace-tools.ts')) {
      tree.delete('tools/src/lib/workspace-tools.ts');
    }
    if (tree.exists('tools/src/lib/workspace-tools.spec.ts')) {
      tree.delete('tools/src/lib/workspace-tools.spec.ts');
    }
    CoerceFile(tree, 'tools/src/index.ts', 'export {};', true);
  }

}
