import {
  addProjectConfiguration,
  readJson,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import swaggerGenerator from './swagger/generator';

describe('plugin-nestjs swagger generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    addProjectConfiguration(tree, 'api', {
      root: 'apps/api',
      sourceRoot: 'apps/api/src',
      projectType: 'application',
      tags: ['nest'],
      targets: { build: { executor: '@nx/webpack:webpack', options: { main: 'apps/api/src/main.ts' } } },
    });
    tree.write('apps/api/src/main.ts', '');
    tree.write('apps/api/webpack.config.js', 'module.exports = {};');
  });

  afterEach(() => jest.restoreAllMocks());

  it('generates the swagger files and dependencies', async () => {
    await swaggerGenerator(tree, { project: 'api' } as any);
    expect(tree.exists('apps/api/src/swagger.ts')).toBe(true);
    const pkg = readJson(tree, 'package.json');
    expect({ ...pkg.dependencies, ...pkg.devDependencies }['@nestjs/swagger']).toBeDefined();
    expect(tree.read('.gitignore', 'utf-8')).toContain('swagger/**/*.*');
    expect(tree.read('.nxignore', 'utf-8')).toContain('!swagger/**/openapi.json');
  });
});
