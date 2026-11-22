import {
  addProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { processProject } from './process-project';
import { processSourceFile } from './process-source-file';

jest.mock('@rxap/workspace-ts-morph', () => ({
  AddDir: (tree: Tree, dir: string, project: any) => {
    for (const child of tree.children(dir)) {
      project.createSourceFile(`${ dir }/${ child }`, tree.read(`${ dir }/${ child }`, 'utf-8') ?? '');
    }
  },
}));
jest.mock('./process-source-file', () => ({ processSourceFile: jest.fn() }));

describe('processProject', () => {

  let tree: Tree;
  const processMock = processSourceFile as jest.Mock;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'lib', { root: 'libs/lib', sourceRoot: 'libs/lib/src' });
    tree.write('libs/lib/src/a.ts', 'export function a() {}');
    tree.write('libs/lib/src/index.ts', 'export * from "./a";');
    processMock.mockReset().mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should process all non-skipped source files', async () => {
    await processProject({}, 'lib', tree);
    expect(processMock).toHaveBeenCalledTimes(1);
  });

  it('should honor the filter', async () => {
    await processProject({ filter: 'nomatch' }, 'lib', tree);
    expect(processMock).not.toHaveBeenCalled();
  });

  it('should stop on an error', async () => {
    processMock.mockRejectedValue(new Error('boom'));
    await processProject({}, 'lib', tree);
    expect(console.error).toHaveBeenCalled();
  });

  it('should stop when the max time is reached', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValue(now + 1000 * 60 * 60);
    await processProject({}, 'lib', tree);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Max time reached'));
  });

});
