import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));
jest.mock('@rxap/plugin-angular', () => ({ AngularInitGenerator: jest.fn(async () => undefined) }));
jest.mock('@rxap/plugin-workspace', () => ({ WorkspaceInitGenerator: jest.fn(async () => undefined) }));

import { installPackagesTask } from '@nx/devkit';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { WorkspaceInitGenerator } from '@rxap/plugin-workspace';
import presetGenerator from './generator';

describe('preset-angular preset generator (delegation)', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
  });

  it('delegates and installs packages', async () => {
    await presetGenerator(tree, { packages: true, standalone: false, license: 'mit', repositoryUrl: 'u', prefix: 'p' });
    expect(WorkspaceInitGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({ packages: true, license: 'mit', overwrite: true }));
    expect(AngularInitGenerator).toHaveBeenCalledWith(tree, { prefix: 'p', overwrite: true });
    expect(installPackagesTask).toHaveBeenCalledWith(tree, true);
  });

  it('skips install', async () => {
    await presetGenerator(tree, { skipInstall: true });
    expect(installPackagesTask).not.toHaveBeenCalled();
  });
});
