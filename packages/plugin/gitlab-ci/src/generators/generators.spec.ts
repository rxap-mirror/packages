import {
  addProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse } from 'yaml';
import dockerGenerator from './docker/generator';
import { skipProject } from './docker/skip-project';
import initGenerator from './init/generator';

describe('gitlab-ci generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('init', () => {

    it('should generate local files by default', async () => {
      await initGenerator(tree, { skipFormat: true });
      expect(tree.exists('.gitlab-ci.yml')).toBe(true);
      expect(tree.children('').some(name => name.includes('gitlab'))).toBe(true);
    });

    it.each([
      [ 'pnpm', 'pnpm-lock.yaml', '.pnpm-store', 'pnpm exec nx run-many', 'pnpm install --frozen-lockfile' ],
      [ 'npm', 'package-lock.json', '.npm', 'npx nx run-many', 'npm ci' ],
      [ 'yarn', 'yarn.lock', '.yarn/cache', 'yarn nx run-many', 'yarn --immutable' ],
    ])('should render the ci files for %s', async (name, lockfile, cacheDir, runMany, install) => {
      tree.write(lockfile, '');
      await initGenerator(tree, { skipFormat: true });
      const npmCache = parse(tree.read('.gitlab/ci/utilities/npm-cache.yaml', 'utf-8')!);
      expect(npmCache['.with_npm_cache'].cache.key.files).toEqual([ lockfile ]);
      expect(npmCache['.with_npm_cache'].cache.paths).toContain(cacheDir);
      expect(tree.read('.gitlab/ci/utilities/nx.yaml', 'utf-8')).toContain(runMany);
      expect(tree.read('tools/scripts/install-dependencies.sh', 'utf-8')).toContain(install);
      if (name !== 'yarn') {
        for (const { path } of tree.listChanges()) {
          if (path.startsWith('.gitlab') || path.startsWith('tools/scripts')) {
            expect({ path, content: tree.read(path, 'utf-8') }).toEqual({ path, content: expect.not.stringMatching(/\byarn\b/) });
          }
        }
      }
    });

    it('should generate the gitlab setup script with release-it', async () => {
      await initGenerator(tree, { skipFormat: true, release: 'release-it' });
      const files = tree.listChanges().map(change => change.path);
      const script = files.find(path => path.includes('gitlab') && path.endsWith('.sh'));
      expect(script).toBeDefined();
      expect(tree.read(script!, 'utf-8')).toContain('Release It Setup');
    });

    it.each([ 'component', 'local' ] as const)('should generate components includes with source %s', async (componentsSource) => {
      await initGenerator(tree, {
        skipFormat: true, components: true, componentsSource, release: 'release-it', dte: true, parallel: 3, helmChart: 'a/b',
      });
      const gitlabCi = parse(tree.read('.gitlab-ci.yml', 'utf-8')!);
      expect(gitlabCi.include.length).toBeGreaterThanOrEqual(3);
      const nx = gitlabCi.include.find((i: any) => (i.component ?? i.local).includes('nx-workspace'));
      expect(nx.inputs).toEqual({ dte: true, parallel: 3 });
      expect(nx.rules).toEqual([ { if: '$RELEASE_IT != "true"' } ]);
    });

    it('should not support schematic-release with components', async () => {
      await expect(initGenerator(tree, { skipFormat: true, components: true, release: 'schematic-release' }))
        .rejects.toThrow('not supported');
    });

    it('should accept the project option', async () => {
      await initGenerator(tree, { skipFormat: true, project: 'x', overwrite: true });
      expect(tree.exists('.gitlab-ci.yml')).toBe(true);
    });

  });

  describe('docker', () => {

    beforeEach(() => {
      addProjectConfiguration(tree, 'api', {
        root: 'apps/api',
        projectType: 'application',
        targets: { docker: { executor: 'x', options: {} } },
      });
      addProjectConfiguration(tree, 'plain', { root: 'apps/plain', projectType: 'application', targets: {} });
    });

    it('should skip projects without docker target', () => {
      expect(skipProject(tree, {}, { root: 'a', targets: {} }, 'a')).toBe(true);
      expect(skipProject(tree, {}, { root: 'a', targets: { docker: { executor: 'x' } } }, 'a')).toBe(false);
      expect(skipProject(tree, { project: 'a' }, { root: 'a', targets: {} }, 'a')).toBe(false);
    });

    it('should generate local job files', async () => {
      await dockerGenerator(tree, { skipFormat: true });
      expect(tree.exists('.gitlab/ci/jobs/docker.yaml')).toBe(true);
      expect(tree.exists('.gitlab/ci/jobs/startup.yaml')).toBe(true);
      expect(tree.exists('.gitlab/ci/jobs/service-e2e.yaml')).toBe(true);
    });

    it('should delete skipped job files and merge existing', async () => {
      await dockerGenerator(tree, { skipFormat: true });
      await dockerGenerator(tree, { skipFormat: true, skipStartup: true, skipE2eService: true, gitlab: true, gcp: true });
      expect(tree.exists('.gitlab/ci/jobs/docker.yaml')).toBe(true);
      expect(tree.exists('.gitlab/ci/jobs/startup.yaml')).toBe(false);
      expect(tree.exists('.gitlab/ci/jobs/service-e2e.yaml')).toBe(false);
    });

    it('should set matrices on the nx-workspace component', async () => {
      await initGenerator(tree, { skipFormat: true, components: true });
      await dockerGenerator(tree, { skipFormat: true, components: true });
      const gitlabCi = parse(tree.read('.gitlab-ci.yml', 'utf-8')!);
      const nx = gitlabCi.include.find((i: any) => i.component?.includes('nx-workspace'));
      expect(nx.inputs.docker_matrix).toBeDefined();
      expect(nx.inputs.startup_matrix).toBeDefined();
      expect(nx.inputs.service_e2e_matrix).toBeDefined();
    });

    it('should omit startup and e2e matrices when skipped', async () => {
      await initGenerator(tree, { skipFormat: true, components: true });
      await dockerGenerator(tree, { skipFormat: true, components: true, skipStartup: true, skipE2eService: true });
      const nx = parse(tree.read('.gitlab-ci.yml', 'utf-8')!).include.find((i: any) => i.component?.includes('nx-workspace'));
      expect(nx.inputs.startup_matrix).toBeUndefined();
    });

    it('should require the nx-workspace component', async () => {
      tree.write('.gitlab-ci.yml', 'include: []\n');
      await expect(dockerGenerator(tree, { skipFormat: true, components: true })).rejects.toThrow('nx-workspace');
    });

  });

});
