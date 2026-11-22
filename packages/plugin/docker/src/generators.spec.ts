const dockerGitlabCi = jest.fn();
jest.mock('@rxap/plugin-gitlab-ci', () => ({ DockerGitlabCiGenerator: (...a: any[]) => dockerGitlabCi(...a) }));

import {
  addProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import configGenerator from './generators/config/generator';
import gitlabCiGenerator from './generators/gitlab-ci/generator';
import initGenerator from './generators/init/generator';

describe('plugin-docker generators', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('init registers the nx plugin', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await initGenerator(tree, {});
    expect(JSON.stringify(readNxJson(tree))).toContain('@rxap/plugin-docker/plugin');
    await initGenerator(tree, { skipFormat: true });
  });

  it('gitlab-ci delegates to DockerGitlabCiGenerator', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await gitlabCiGenerator(tree, { gcp: true });
    expect(dockerGitlabCi).toHaveBeenCalledWith(tree, { gcp: true, components: false });
  });

  describe('config', () => {
    it('throws for unknown source root', async () => {
      const tree = createTreeWithEmptyWorkspace();
      await expect(configGenerator(tree, { project: 'nope' })).rejects.toThrow();
    });

    it('adds docker target with options and save target', async () => {
      const tree = createTreeWithEmptyWorkspace();
      addProjectConfiguration(tree, 'app', {
        root: 'apps/app',
        sourceRoot: 'apps/app/src',
        targets: { build: { executor: 'x', configurations: { production: {} } } },
      });
      await configGenerator(tree, {
        project: 'app', dockerfile: 'Dockerfile', imageSuffix: '-s', imageName: 'n', imageRegistry: 'r', context: 'c', command: 'podman', save: true,
      });
      const config = readProjectConfiguration(tree, 'app');
      expect(config.targets?.['docker']).toEqual(expect.objectContaining({
        executor: '@rxap/plugin-docker:build',
        options: { dockerfile: 'Dockerfile', imageSuffix: '-s', imageName: 'n', imageRegistry: 'r', context: 'c', command: 'podman' },
      }));
    });

    it('is a no-op for existing docker target', async () => {
      const tree = createTreeWithEmptyWorkspace();
      addProjectConfiguration(tree, 'app', {
        root: 'apps/app',
        sourceRoot: 'apps/app/src',
        targets: {
          docker: { executor: 'custom' },
          save: { executor: '@rxap/plugin-docker:save' },
        },
      });
      await configGenerator(tree, { project: 'app', save: true });
      expect(readProjectConfiguration(tree, 'app').targets?.['docker']?.executor).toBe('custom');
    });
  });
});
