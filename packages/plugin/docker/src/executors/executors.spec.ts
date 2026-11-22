const utils = {
  dockerBuild: jest.fn(),
  dockerPush: jest.fn(),
  dockerSave: jest.fn(),
  getFallBackImageTag: jest.fn(),
  loginToRegistry: jest.fn(),
  getGitlabRegistryDestination: jest.fn(),
};
jest.mock('../lib/utilities', () => utils);

const hasProjectTarget = jest.fn();
jest.mock('@rxap/plugin-utilities', () => ({
  GetProjectRoot: () => 'apps/app',
  GetProjectSourceRoot: () => 'apps/app/src',
  GuessOutputPathFromContext: () => 'dist/apps/app',
  HasProjectTarget: (...a: any[]) => hasProjectTarget(...a),
  GetProjectConfiguration: () => ({}),
}));
const targetOptions = jest.fn();
jest.mock('@rxap/workspace-utilities', () => ({
  ProcessBuildArgs: () => [ 'A=1' ],
  GetTarget: () => ({}),
  GetTargetOptions: () => targetOptions(),
}));
const existsSync = jest.fn();
jest.mock('fs', () => ({ ...jest.requireActual('fs'), existsSync: (p: string) => existsSync(p) }));

import buildExecutor from './build/executor';
import saveExecutor from './save/executor';

describe('docker executors', () => {
  const ctx: any = { root: '/ws', projectName: 'app' };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    utils.getFallBackImageTag.mockResolvedValue('fb');
    utils.getGitlabRegistryDestination.mockImplementation((_o, _n, tag) => `dest:${ tag ?? 'default' }`);
    utils.dockerBuild.mockResolvedValue(0);
    utils.dockerPush.mockResolvedValue(0);
    utils.dockerSave.mockResolvedValue(undefined);
    existsSync.mockReturnValue(false);
    hasProjectTarget.mockReturnValue(false);
    delete process.env['LATEST'];
  });

  describe('build', () => {
    it('builds with default tag, no dockerfile', async () => {
      const options: any = { command: 'docker' };
      await expect(buildExecutor(options, ctx)).resolves.toEqual({ success: true });
      expect(utils.dockerBuild).toHaveBeenCalledWith('docker', '/ws/apps/app', [ 'dest:default' ], undefined, [ 'A=1' ]);
      expect(utils.dockerPush).not.toHaveBeenCalled();
    });
    it('detects Dockerfile in project root and uses its dir as context', async () => {
      existsSync.mockImplementation((p: string) => p === 'apps/app/Dockerfile');
      const options: any = { command: 'docker' };
      await buildExecutor(options, ctx);
      expect(options.dockerfile).toBe('apps/app/Dockerfile');
      expect(options.context).toBe('apps/app');
    });
    it('resolves relative dockerfile against project root then workspace root', async () => {
      existsSync.mockImplementation((p: string) => p === '/ws/apps/app/Dockerfile.x');
      const o1: any = { command: 'docker', dockerfile: 'Dockerfile.x' };
      await buildExecutor(o1, ctx);
      expect(o1.dockerfile).toBe('/ws/apps/app/Dockerfile.x');
      existsSync.mockImplementation((p: string) => p === '/ws/Dockerfile.y');
      const o2: any = { command: 'docker', dockerfile: 'Dockerfile.y' };
      await buildExecutor(o2, ctx);
      expect(o2.dockerfile).toBe('/ws/Dockerfile.y');
      const o3: any = { command: 'docker', dockerfile: '/abs/Dockerfile' };
      await buildExecutor(o3, ctx);
      expect(o3.dockerfile).toBe('/abs/Dockerfile');
    });
    it('uses build target output path as context and prefixes registry', async () => {
      hasProjectTarget.mockReturnValue(true);
      const options: any = { command: 'docker', imageRegistry: 'reg', imageName: 'img', tag: 't1', latest: true, push: true };
      await expect(buildExecutor(options, ctx)).resolves.toEqual({ success: true });
      expect(options.imageName).toBe('reg/img');
      expect(options.context).toBe('/ws/dist/apps/app');
      expect(utils.dockerBuild.mock.calls[0][2]).toEqual([ 'dest:t1', 'dest:latest' ]);
      expect(utils.dockerPush).toHaveBeenCalledWith('docker', [ 'dest:t1', 'dest:latest' ]);
    });
    it('supports tag arrays and LATEST env', async () => {
      process.env['LATEST'] = '1';
      await buildExecutor({ command: 'docker', tag: [ 'a', 'b' ] } as any, ctx);
      expect(utils.dockerBuild.mock.calls[0][2]).toEqual([ 'dest:a', 'dest:b', 'dest:latest' ]);
    });
    it('returns failure when build fails or push fails', async () => {
      utils.dockerBuild.mockResolvedValue(1);
      await expect(buildExecutor({ command: 'docker' } as any, ctx)).resolves.toEqual({ success: false });
      utils.dockerBuild.mockResolvedValue(0);
      utils.dockerPush.mockResolvedValue(1);
      await expect(buildExecutor({ command: 'docker', push: true } as any, ctx)).resolves.toEqual({ success: false });
    });
  });

  describe('save', () => {
    it('saves default tag to default output path', async () => {
      targetOptions.mockReturnValue({});
      await expect(saveExecutor({} as any, ctx)).resolves.toEqual({ success: true });
      expect(utils.dockerSave).toHaveBeenCalledWith([ 'dest:default' ], '/ws/dist/docker/app.tar.gz');
    });
    it('saves tags, latest and registry-prefixed name', async () => {
      targetOptions.mockReturnValue({ imageRegistry: 'r', imageName: 'n', tag: [ 'a' ], latest: true });
      await saveExecutor({ outputPath: '/o' } as any, ctx);
      expect(utils.dockerSave).toHaveBeenCalledWith([ 'dest:a', 'dest:latest' ], '/o/app.tar.gz');
      expect(utils.getGitlabRegistryDestination.mock.calls[0][4]).toBe('r/n');
    });
  });
});
