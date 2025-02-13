import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import presetGenerator from './generator';

describe('preset', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should use angular preset', async () => {

    await presetGenerator(tree, {
      packages: false,
      standalone: false,
      repositoryUrl: 'https://gitlab.com/rxap/packages/testing',
      license: 'gpl' as any,
      skipInstall: true,
    });

    expect(tree.children('')).toMatchSnapshot();
    expect(tree.read('package.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('nx.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.gitignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.prettierrc', 'utf-8')).toMatchSnapshot();
    expect(tree.read('tsconfig.base.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.commitlintrc.js', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.renovaterc.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.yarnrc.yml', 'utf-8')).toMatchSnapshot();
    expect(tree.read('LICENSE', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.prettierignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('project.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.eslintrc.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.eslintignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('jest.preset.js', 'utf-8')).toMatchSnapshot();
    expect(tree.read('jest.config.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('schematic.yaml', 'utf-8')).toMatchSnapshot();
    expect(tree.children('angular')).toMatchSnapshot();

  }, 5000 * 32);

});
