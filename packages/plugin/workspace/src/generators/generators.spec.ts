import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  updateJson,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import fixImplicitInternalDependenciesGenerator from './fix-implicit-internal-dependencies/generator';
import projectTargetGenerator from './project-target/generator';
import renameGenerator from './rename/generator';

describe('workspace generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('rename', () => {

    beforeEach(() => {
      writeJson(tree, 'project.json', {
        name: 'old',
        root: '.',
        targets: {
          build: { executor: 'x', options: { outputPath: 'dist/old' } },
          serve: {
            executor: 'y',
            options: { buildTarget: 'old:build' },
            configurations: { production: { buildTarget: 'old:build:production' }, development: { buildTarget: 'old:build:development' } },
          },
        },
      });
      tree.write('jest.config.ts', `export default { displayName: 'old', coverageDirectory: './coverage/old', };`);
      writeJson(tree, 'e2e/project.json', { name: 'old-e2e', implicitDependencies: [ 'old' ] });
    });

    it('should rename a standalone project', async () => {
      await renameGenerator(tree, { name: 'new', tags: [ 'a' ] });
      const project = readJson(tree, 'project.json');
      expect(project.name).toBe('new');
      expect(project.tags).toEqual([ 'a' ]);
      expect(project.targets.build.options.outputPath).toBe('dist/new');
      expect(project.targets.serve.options.buildTarget).toBe('new:build');
      expect(project.targets.serve.configurations.production.buildTarget).toBe('new:build:production');
      expect(project.targets.serve.configurations.development.buildTarget).toBe('new:build:development');
      expect(tree.read('jest.config.ts', 'utf-8')).toContain(`displayName: 'new'`);
      expect(tree.read('jest.config.ts', 'utf-8')).toContain(`./coverage/new`);
      expect(readJson(tree, 'e2e/project.json')).toEqual({ name: 'new-e2e', implicitDependencies: [ 'new' ] });
    });

    it('should rename a project in a sub folder', async () => {
      addProjectConfiguration(tree, 'sub', { root: 'apps/sub' });
      await renameGenerator(tree, { project: 'sub', name: 'renamed' });
      expect(readProjectConfiguration(tree, 'renamed').root).toBe('apps/sub');
    });

  });

  describe('project-target', () => {

    beforeEach(() => {
      updateJson(tree, 'nx.json', json => {
        json.targetDefaults = {
          build: {
            executor: 'x', inputs: [ 'a' ], outputs: [ 'o' ], dependsOn: [ '^build' ], defaultConfiguration: 'prod',
            options: { same: 1 }, configurations: { prod: { same: 2 } }, command: 'cmd',
          },
        };
        return json;
      });
      addProjectConfiguration(tree, 'p', {
        root: 'libs/p',
        targets: {
          z: { executor: 'z', options: {}, configurations: { empty: {} }, inputs: [], outputs: [], dependsOn: [] },
          build: {
            executor: 'x', inputs: [ 'a', 'b' ], outputs: [ 'o', 'p' ], dependsOn: [ '^build', 'other' ], defaultConfiguration: 'prod',
            options: { same: 1, different: 2 }, configurations: { prod: { same: 2, other: 3 } }, command: 'cmd',
          },
        },
      });
    });

    it('should simplify, cleanup and reorder', async () => {
      await projectTargetGenerator(tree, { simplify: true, cleanup: true, reorder: true });
      const targets = readProjectConfiguration(tree, 'p').targets!;
      expect(Object.keys(targets)).toEqual([ 'build', 'z' ]);
      expect(targets['build']).toEqual({
        inputs: [ 'b' ], outputs: [ 'p' ], dependsOn: [ 'other' ], options: { different: 2 }, configurations: { prod: { other: 3 } },
      });
      expect(targets['z']).toEqual({ executor: 'z' });
    });

    it('should not change targets without flags', async () => {
      await projectTargetGenerator(tree, {});
      expect(readProjectConfiguration(tree, 'p').targets!['build'].executor).toBe('x');
    });

    it('should remove empty targets', async () => {
      addProjectConfiguration(tree, 'empty', { root: 'libs/empty' });
      await projectTargetGenerator(tree, { project: 'empty' });
      expect(readProjectConfiguration(tree, 'empty').targets).toBeUndefined();
    });

    it('should fail without nx.json', async () => {
      tree.delete('nx.json');
      await expect(projectTargetGenerator(tree, {})).rejects.toThrow('nx.json');
    });

  });

  describe('fix-implicit-internal-dependencies', () => {

    function application(name: string, targets: Record<string, any>) {
      addProjectConfiguration(tree, name, {
        root: `apps/${ name }`,
        projectType: 'application',
        targets: { build: { executor: 'x', options: { outputPath: `dist/${ name }` } }, ...targets },
      });
    }

    it('should add implicit dependencies for internal executors', async () => {
      addProjectConfiguration(tree, 'plugin', { root: 'packages/plugin', projectType: 'library' });
      writeJson(tree, 'packages/plugin/package.json', { name: '@scope/plugin' });
      application('app', { custom: { executor: '@scope/plugin:run' }, none: {} });
      updateJson(tree, 'nx.json', json => {
        json.targetDefaults = { none: { executor: '@scope/plugin:other' } };
        return json;
      });
      await fixImplicitInternalDependenciesGenerator(tree, {});
      expect(readProjectConfiguration(tree, 'app').implicitDependencies).toEqual([ 'plugin' ]);
    });

    it('should skip targets without executor', async () => {
      application('app', { none: {} });
      await fixImplicitInternalDependenciesGenerator(tree, { project: 'app' });
      expect(readProjectConfiguration(tree, 'app').implicitDependencies).toBeUndefined();
    });

    it('should not add the project itself', async () => {
      application('app', { custom: { executor: '@scope/app:run' } });
      writeJson(tree, 'apps/app/package.json', { name: '@scope/app' });
      await fixImplicitInternalDependenciesGenerator(tree, {});
      expect(readProjectConfiguration(tree, 'app').implicitDependencies).toBeUndefined();
    });

  });

});
