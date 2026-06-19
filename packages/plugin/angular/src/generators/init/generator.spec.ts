import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { SnapshotGeneratedTree } from '@rxap/plugin-utilities';
import initGenerator from './generator';

describe('plugin-angular:init (golden master)', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should produce a stable workspace-init tree', async () => {

    await initGenerator(tree, {
      overwrite: false,
      skipFormat: false,
      skipProjects: false,
      withSharedLibraries: false,
    } as any);

    // Golden master: full content of every file the workspace-init touched
    // (nx.json plugin/target wiring, package.json @nx/angular dependency, the
    // serialized schematic file). A framework migration that changes any of
    // this output produces a reviewable snapshot diff.
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('init-tree');

  }, 5000 * 4);

});
