import { readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';

describe('kraft init generator', () => {

  it('should register the plugin and ignore .unikraft', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await initGenerator(tree, {} as any);
    const plugins = readJson(tree, 'nx.json').plugins;
    expect(JSON.stringify(plugins)).toContain('plugin-kraft');
    expect(tree.read('.gitignore', 'utf-8')).toContain('.unikraft');
  });

  it('should add idea exclude folders for jetbrains projects', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('.idea/workspace.xml', '<project/>');
    await initGenerator(tree, {} as any);
    expect(tree.read('.gitignore', 'utf-8')).toContain('.unikraft');
  });

});
