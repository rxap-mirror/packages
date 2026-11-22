import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import configGenerator from './config/generator';
import initGenerator from './init/generator';

describe('localazy generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('init', () => {
    it('should add the plugin and cli dependency', async () => {
      await initGenerator(tree, { skipFormat: true });
      expect(JSON.stringify(readJson(tree, 'nx.json').plugins)).toContain('plugin-localazy');
      expect(readJson(tree, 'package.json').devDependencies['@localazy/cli']).toBeDefined();
    });
  });

  describe('config', () => {
    beforeEach(() => {
      addProjectConfiguration(tree, 'app', {
        root: 'apps/app',
        sourceRoot: 'apps/app/src',
        projectType: 'application',
        targets: { 'extract-i18n': { executor: '@angular/build:extract-i18n' } },
      });
    });

    it('should create the config file and update targets', async () => {
      await configGenerator(tree, { project: 'app', readKey: 'rk' });
      expect(tree.exists('apps/app/localazy.json')).toBe(true);
      const project = readProjectConfiguration(tree, 'app');
      expect(project.targets!['extract-i18n'].options.format).toBe('xliff2');
      expect(project.targets!['extract-i18n'].options.outputPath).toBe('apps/app/src/i18n');
      expect(project.targets!['localazy-download'].options.readKey).toBe('rk');
      expect(tree.read('apps/app/src/.gitignore', 'utf-8')).toContain('/i18n');
    });

    it('should work without extract target and read key', async () => {
      addProjectConfiguration(tree, 'lib', { root: 'libs/lib', sourceRoot: 'libs/lib/src', targets: {} });
      await configGenerator(tree, { project: 'lib' });
      expect(readProjectConfiguration(tree, 'lib').targets!['localazy-download']).toBeUndefined();
    });
  });

});
