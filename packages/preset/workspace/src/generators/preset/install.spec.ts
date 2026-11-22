const installPackagesTask = jest.fn();
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: (...a: any[]) => installPackagesTask(...a),
}));
const workspaceInit = jest.fn();
jest.mock('@rxap/plugin-workspace', () => ({ WorkspaceInitGenerator: (...a: any[]) => workspaceInit(...a) }));

import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import presetGenerator from './generator';

describe('preset workspace install', () => {
  it('forwards options and installs packages unless skipped', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await presetGenerator(tree, { packages: true, standalone: false, license: 'gpl' as any, repositoryUrl: 'u' });
    expect(workspaceInit).toHaveBeenCalledWith(tree, { packages: true, standalone: false, license: 'gpl', repositoryUrl: 'u', overwrite: true });
    expect(installPackagesTask).toHaveBeenCalledWith(tree, true);
    installPackagesTask.mockClear();
    await presetGenerator(tree, { packages: true, standalone: false, license: 'gpl' as any, repositoryUrl: 'u', skipInstall: true });
    expect(installPackagesTask).not.toHaveBeenCalled();
  });
});
