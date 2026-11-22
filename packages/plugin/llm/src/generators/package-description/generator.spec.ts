import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Project } from 'ts-morph';
import { completion } from '../../lib/completion';
import packageDescriptionGenerator from './generator';

const transform = jest.fn();
jest.mock('@rxap/workspace-ts-morph', () => ({ TsMorphTransform: (...args: any[]) => transform(...args) }));
jest.mock('../../lib/completion', () => ({ completion: jest.fn() }));

describe('package description generator', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'lib', {
      root: 'libs/lib',
      sourceRoot: 'libs/lib/src',
      projectType: 'library',
      targets: { build: { executor: '@nx/js:tsc', options: {} } },
    });
    writeJson(tree, 'libs/lib/package.json', { name: '@scope/lib', version: '1.0.0', publishConfig: { access: 'public' } });
    transform.mockReset().mockImplementation(async (_tree: any, _path: string, cb: any) => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile('/a.ts', 'export const a = 1;');
      cb(project);
    });
    (completion as jest.Mock).mockReset().mockResolvedValue('A description');
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should reject unsupported models', async () => {
    await expect(packageDescriptionGenerator(tree, { project: 'lib', model: 'foo' })).rejects.toThrow('not supported');
  });

  it('should skip non library projects', async () => {
    addProjectConfiguration(tree, 'app', { root: 'apps/app', projectType: 'application' });
    await packageDescriptionGenerator(tree, { project: 'app' });
    expect(completion).not.toHaveBeenCalled();
  });

  it('should write the description to the package.json', async () => {
    await packageDescriptionGenerator(tree, { project: 'lib', apiKey: 'k' });
    expect(completion).toHaveBeenCalledTimes(1);
    expect((completion as jest.Mock).mock.calls[0][1]).toContain('@scope/lib');
    expect(readJson(tree, 'libs/lib/package.json').description).toBe('A description');
  });

  it('should keep an existing description without overwrite', async () => {
    writeJson(tree, 'libs/lib/package.json', { name: '@scope/lib', description: 'old', publishConfig: { access: 'public' } });
    await packageDescriptionGenerator(tree, { project: 'lib' });
    expect(completion).not.toHaveBeenCalled();
    await packageDescriptionGenerator(tree, { project: 'lib', overwrite: true });
    expect(readJson(tree, 'libs/lib/package.json').description).toBe('A description');
  });

});
