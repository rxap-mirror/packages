import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/nest/src/generators/library/library';
import {
  CompileGeneratedFiles,
  SnapshotGeneratedTree,
} from '@rxap/plugin-utilities';
import dynamicConfigurationModuleGenerator from './generator';

describe('dynamic-configuration-module (semantic compile)', () => {

  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await libraryGenerator(tree, { name: 'test', directory: 'test' });
  });

  it('generated config-module code type-checks against the real framework', async () => {

    await dynamicConfigurationModuleGenerator(tree, { project: 'test', isGlobal: true });

    // Compile the generated TypeScript against the workspace's real @nestjs /
    // @rxap types. A migration that makes the generator emit code that no longer
    // type-checks (removed/renamed API, changed signature) fails here.
    expect(CompileGeneratedFiles(SnapshotGeneratedTree(tree))).toEqual([]);

  }, 5000 * 12);

});
