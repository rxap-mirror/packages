import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetDefaultGeneratorOptions,
  HasProject,
} from '@rxap/workspace-utilities';

export async function coerceToolsProject(tree: Tree) {

  if (!HasProject(tree, 'workspace-tools')) {
    // nx g @nx/js:library --name=workspace-tools --directory=tools --importPath=workspace-tools --projectNameAndRootFormat=as-provided
    const defaultOptions = GetDefaultGeneratorOptions(tree, '@nx/js:library');
    const tags = (defaultOptions.tags as string ?? '').split(',').map(tag => tag.trim());
    CoerceArrayItems(tags, ['internal']);
    await libraryGenerator(tree, {
      ...defaultOptions,
      tags: tags.join(','),
      name: 'workspace-tools',
      directory: 'tools',
      importPath: 'workspace-tools',
      projectNameAndRootFormat: 'as-provided',
    });
    tree.write('tools/project.json', JSON.stringify({
      name: 'workspace-tools',
      $schema: '../node_modules/nx/schemas/project-schema.json',
      targets: {},
      tags: [ 'internal' ],
    }));
  }

}
