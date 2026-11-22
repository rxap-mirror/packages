import {
  addProjectConfiguration,
  readJson,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';

describe('application init generator', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should init the workspace with default options', async () => {
    await initGenerator(tree, { skipProjects: true, skipFormat: true });
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['@rxap/plugin-docker']).toBeDefined();
    expect(packageJson.devDependencies['jest-junit']).toBeDefined();
    expect(packageJson['jest-junit'].uniqueOutputName).toBe(true);
    expect(readJson(tree, 'nx.json').targetDefaults).toBeDefined();
  });

  it('should skip docker compose files in standalone mode', async () => {
    await initGenerator(tree, { skipProjects: true, skipFormat: true, standalone: true });
    expect(tree.exists('docker-compose.yml')).toBe(false);
  });

  it('should init authentik, minio and oauth2-proxy files', async () => {
    const before = tree.listChanges().length;
    await initGenerator(tree, {
      skipProjects: true,
      skipFormat: true,
      authentik: true,
      minio: true,
      authentication: 'oauth2-proxy',
    });
    expect(tree.listChanges().length).toBeGreaterThan(before);
  });

  it('should init an application project', async () => {
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      sourceRoot: 'apps/my-app/src',
      projectType: 'application',
      targets: {
        build: { executor: '@angular-devkit/build-angular:application' },
        test: { executor: '@nx/jest:jest', options: { jestConfig: 'apps/my-app/jest.config.ts' } },
      },
    });
    tree.write('apps/my-app/jest.config.ts', `export default { displayName: 'my-app', reporters: [] };`);
    await initGenerator(tree, { project: 'my-app', skipFormat: true });
    const project = JSON.parse(tree.read('apps/my-app/project.json', 'utf-8')!);
    expect(project.tags).toBeDefined();
  });

  it('should not touch library projects', async () => {
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      projectType: 'library',
      targets: {},
    });
    await initGenerator(tree, { skipFormat: true });
    expect(JSON.parse(tree.read('libs/my-lib/project.json', 'utf-8')!).tags).toBeUndefined();
  });

  it('should init standalone project with e2e project', async () => {
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      projectType: 'application',
      targets: {},
    });
    addProjectConfiguration(tree, 'my-app-e2e', {
      root: 'apps/my-app-e2e',
      projectType: 'application',
      targets: { e2e: { executor: '@nx/cypress:cypress', options: {} } },
    });
    await initGenerator(tree, { project: 'my-app', standalone: true, skipFormat: true });
    expect(tree.exists('apps/my-app/project.json')).toBe(true);
  });

});
