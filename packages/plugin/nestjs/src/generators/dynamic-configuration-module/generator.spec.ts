import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/nest/src/generators/library/library';
import dynamicConfigurationModuleGenerator from './generator';

describe('dynamic-configuration-module', () => {

  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await libraryGenerator(tree, {
      name: 'test',
      directory: 'test',
    });
    expect(tree.exists('test/project.json')).toBeTruthy();
    expect(tree.exists('test/src/lib/test.module.ts')).toBeTruthy();
  });

  it('should add global dynamic configuration module to the root module', async () => {
    await dynamicConfigurationModuleGenerator(tree, {
      project: 'test',
      isGlobal: true,
    });
    expect(tree.exists('test/src/lib/test-module-options.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/test-module-options.factory.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/test-validation-schema.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/tokens.ts')).toBeTruthy();

    expect(tree.read('test/src/lib/test.module.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-module-options.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-module-options.factory.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-validation-schema.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/tokens.ts', 'utf-8')).toMatchSnapshot();

    expect(tree.read('test/src/index.ts', 'utf-8')).toMatchSnapshot();
  });

  it('should add local dynamic configuration module to the root module', async () => {
    await dynamicConfigurationModuleGenerator(tree, {
      project: 'test',
      isGlobal: false,
    });
    expect(tree.exists('test/src/lib/test-module-options.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/test-module-options.factory.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/test-validation-schema.ts')).toBeTruthy();
    expect(tree.exists('test/src/lib/tokens.ts')).toBeTruthy();

    expect(tree.read('test/src/lib/test.module.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-module-options.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-module-options.factory.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/test-validation-schema.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('test/src/lib/tokens.ts', 'utf-8')).toMatchSnapshot();

    expect(tree.read('test/src/index.ts', 'utf-8')).toMatchSnapshot();
  });

});
