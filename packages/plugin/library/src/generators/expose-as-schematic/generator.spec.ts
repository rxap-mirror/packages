import {
  addProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { SnapshotGeneratedTree } from '@rxap/plugin-utilities';
import exposeAsSchematicGenerator from './generator';

describe('expose-as-schematic (golden master)', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'my-plugin', {
      root: 'my-plugin',
      sourceRoot: 'my-plugin/src',
      projectType: 'library',
    });
    writeJson(tree, 'my-plugin/package.json', {
      name: '@rxap/my-plugin',
      version: '0.0.0',
      generators: './generators.json',
    });
    writeJson(tree, 'my-plugin/generators.json', {
      generators: {
        'my-gen': {
          factory: './src/generators/my-gen/generator',
          schema: './src/generators/my-gen/schema.json',
          description: 'My generator',
        },
      },
    });
  });

  it('serializes each nx generator as an angular schematic wrapper', async () => {

    await exposeAsSchematicGenerator(tree, { project: 'my-plugin' } as any);

    // The bridge writes a convertNxGenerator wrapper next to each generator and
    // registers it under `schematics`. This is the @nx/devkit-dependent surface
    // that an Nx major bump is most likely to break (convertNxGenerator API).
    expect(tree.exists('my-plugin/src/generators/my-gen/index.ts')).toBe(true);
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('exposed-tree');

  });

});
