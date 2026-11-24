import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { SnapshotGeneratedTree } from '@rxap/plugin-utilities';
import initGenerator from './generator';

describe('init', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should init default workspace', async () => {

    await initGenerator(tree, {
      packages: false,
      standalone: false,
      overwrite: false,
      skipFormat: false,
      skipProjects: false,
      skipLicense: false,
      license: 'gpl' as any,
      repositoryUrl: 'https://gitlab.com/rxap/packages/testing',
    });

    expect(tree.children('')).toMatchSnapshot();
    expect(tree.read('package.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('nx.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.gitignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.prettierrc', 'utf-8')).toMatchSnapshot();
    expect(tree.read('tsconfig.base.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.commitlintrc.js', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.renovaterc.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('LICENSE', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.prettierignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('project.json', 'utf-8')).toMatchSnapshot();
    expect(tree.read('eslint.config.mjs', 'utf-8')).toMatchSnapshot();
    expect(tree.read('.eslintignore', 'utf-8')).toMatchSnapshot();
    expect(tree.read('jest.preset.js', 'utf-8')).toMatchSnapshot();
    expect(tree.read('jest.config.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('schematic.yaml', 'utf-8')).toMatchSnapshot();

    // Golden master: full content of every file the generator created/modified,
    // so a migration that changes any generated output (not just the files
    // listed explicitly above) produces a reviewable snapshot diff.
    expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('generated-tree');

  }, 5000 * 4);

  describe('package manager', () => {

    const files = [
      'package.json',
      'nx.json',
      '.gitignore',
      '.yarnrc.yml',
      '.devcontainer/Dockerfile',
      '.devcontainer/devcontainer.json',
      'tools/scripts/schematic.sh',
      '.husky/pre-commit',
      '.husky/post-checkout',
      '.husky/commit-msg',
    ];

    function generatedFiles() {
      return Object.fromEntries(files.map(file => [ file, tree.read(file, 'utf-8') ]));
    }

    it.each([
      [ 'pnpm', 'pnpm-lock.yaml' ],
      [ 'yarn', 'yarn.lock' ],
      [ 'npm', 'package-lock.json' ],
    ])('should render the files for %s detected from %s', async (name, lockfile) => {
      tree.write(lockfile, '');
      await initGenerator(tree, { packages: true, skipFormat: true, withHusky: true, repositoryUrl: 'https://gitlab.com/rxap/packages/testing' });
      const generated = generatedFiles();
      if (name !== 'yarn') {
        for (const [ file, content ] of Object.entries(generated)) {
          expect({ file, content: content ?? '' }).toEqual({ file, content: expect.not.stringMatching(/\byarn\b(?!\.lock)/) });
        }
      }
      expect(generated).toMatchSnapshot();
    });

    it('should prefer the packageManager option', async () => {
      tree.write('yarn.lock', '');
      await initGenerator(tree, { skipFormat: true, packageManager: 'pnpm', repositoryUrl: 'https://gitlab.com/rxap/packages/testing' });
      expect(tree.read('nx.json', 'utf-8')).toContain('"packageManager": "pnpm"');
      expect(tree.read('package.json', 'utf-8')).toContain('"rxap:migrate": "pnpm run rxap:update && pnpm run rxap:compose"');
    });

    it('should keep a matching packageManager field and drop a stale one', async () => {
      tree.write('pnpm-lock.yaml', '');
      tree.write('package.json', JSON.stringify({ name: 'x', packageManager: 'yarn@3.6.0', engines: { yarn: '1.22 || 3.6' } }));
      await initGenerator(tree, { skipFormat: true, repositoryUrl: 'https://gitlab.com/rxap/packages/testing' });
      const packageJson = JSON.parse(tree.read('package.json', 'utf-8')!);
      expect(packageJson.packageManager).toBeUndefined();
      expect(packageJson.engines.yarn).toBeUndefined();

      tree.write('package.json', JSON.stringify({ name: 'x', packageManager: 'pnpm@10.1.0' }));
      await initGenerator(tree, { skipFormat: true, repositoryUrl: 'https://gitlab.com/rxap/packages/testing' });
      expect(JSON.parse(tree.read('package.json', 'utf-8')!).packageManager).toBe('pnpm@10.1.0');
    });

  });

});
