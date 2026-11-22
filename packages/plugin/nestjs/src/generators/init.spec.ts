import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

jest.mock('./init-application/generator', () => ({ __esModule: true, default: jest.fn(async () => undefined) }));
jest.mock('./init-library/generator', () => ({ __esModule: true, default: jest.fn(async () => undefined) }));

import initApplicationGenerator from './init-application/generator';
import initLibraryGenerator from './init-library/generator';
import initGenerator from './init/generator';
import { SkipNonNestProject } from '../lib/skip-non-nest-project';

describe('plugin-nestjs init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    addProjectConfiguration(tree, 'api', { root: 'apps/api', projectType: 'application', tags: ['nest'], targets: {} });
    addProjectConfiguration(tree, 'feat', { root: 'libs/feat', projectType: 'library', tags: ['nest'], targets: {} });
    addProjectConfiguration(tree, 'web', { root: 'apps/web', projectType: 'application', tags: ['angular'], targets: {} });
  });

  afterEach(() => jest.restoreAllMocks());

  it('registers the plugin and dispatches to the project generators', async () => {
    await initGenerator(tree, {} as any);
    expect(readJson(tree, 'nx.json').plugins).toContain('@rxap/plugin-nestjs/application');
    expect(initApplicationGenerator).toHaveBeenCalledTimes(1);
    expect(initApplicationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({
      projects: ['api'],
      bootstrap: 'monolithic',
      transport: 'none',
      typeorm: 'none',
    }));
    expect(initLibraryGenerator).toHaveBeenCalledTimes(1);
    expect(initLibraryGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({ projects: ['feat'] }));
    expect(tree.exists('schematic.yaml') || tree.exists('schematics.yaml')).toBe(true);
  });

  it('handles an explicit project', async () => {
    await initGenerator(tree, { project: 'web', skipFormat: true } as any);
    expect(initApplicationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({ projects: ['web'] }));
  });

  describe('SkipNonNestProject', () => {
    it('skips non nest projects and plugins', () => {
      const get = (name: string) => readProjectConfiguration(tree, name);
      expect(SkipNonNestProject(tree, {} as any, get('web'), 'web')).toBe(true);
      expect(SkipNonNestProject(tree, {} as any, { root: 'p', tags: ['nest', 'plugin'] } as any, 'p')).toBe(true);
      expect(SkipNonNestProject(tree, {} as any, { root: 'p', tags: ['nest', 'schematic'] } as any, 'p')).toBe(true);
      expect(SkipNonNestProject(tree, {} as any, get('api'), 'api')).toBe(false);
    });
  });
});
