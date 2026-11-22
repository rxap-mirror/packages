import { EventEmitter } from 'events';

const spawnMock = jest.fn();
const getCurrentBranchMock = jest.fn();
jest.mock('child_process', () => ({ spawn: (...args: any[]) => spawnMock(...args) }));
jest.mock('@rxap/node-utilities', () => ({ GetCurrentBranch: () => getCurrentBranchMock() }));
const mkdirMock = jest.fn();
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: (...args: any[]) => mkdirMock(...args),
}));

import {
  dockerBuild,
  dockerLogin,
  dockerPush,
  dockerSave,
  getFallBackImageTag,
  getGitlabRegistryDestination,
  loginToRegistry,
} from './utilities';

function fakeProcess(event: 'close' | 'error', arg?: any) {
  const emitter = new EventEmitter();
  setTimeout(() => emitter.emit(event, arg));
  return emitter;
}

describe('docker utilities', () => {
  const env = { ...process.env };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    process.env = { ...env };
    for (const key of [ 'REGISTRY_IMAGE', 'CI_REGISTRY_IMAGE', 'REGISTRY_IMAGE_TAG', 'VERSION', 'CI_COMMIT_TAG', 'CI_COMMIT_BRANCH', 'REGISTRY_IMAGE_SUFFIX', 'REGISTRY_USER', 'CI_REGISTRY_USER', 'REGISTRY_PASSWORD', 'CI_REGISTRY_PASSWORD', 'REGISTRY', 'CI_REGISTRY' ]) {
      delete process.env[key];
    }
  });
  afterAll(() => {
    process.env = env;
  });

  describe('dockerLogin', () => {
    it('spawns docker login', async () => {
      spawnMock.mockReturnValue(fakeProcess('close', 0));
      await expect(dockerLogin('docker', 'reg', 'u', 'p')).resolves.toBe(0);
      expect(spawnMock).toHaveBeenCalledWith('docker', [ 'login', '--password="p"', '--username="u"', 'reg' ], expect.anything());
    });
    it('rejects on error and logs on ENOENT', async () => {
      spawnMock.mockReturnValueOnce(fakeProcess('error', new Error('boom')));
      await expect(dockerLogin('docker', 'r', 'u', 'p')).rejects.toThrow('boom');
      spawnMock.mockReturnValueOnce(fakeProcess('error', Object.assign(new Error('x'), { code: 'ENOENT' })));
      const p = dockerLogin('docker', 'r', 'u', 'p');
      await new Promise(r => setTimeout(r, 20));
      expect(console.error).toHaveBeenCalledWith('Could not find docker');
      void p;
    });
  });

  describe('dockerPush', () => {
    it('throws without tags', async () => {
      await expect(dockerPush('docker', [])).rejects.toThrow('At least one tag');
    });
    it('pushes tags', async () => {
      spawnMock.mockImplementation(() => fakeProcess('close', 0));
      await expect(dockerPush('docker', [ 'a', 'b' ])).resolves.toEqual([ 0, 0 ]);
      expect(spawnMock).toHaveBeenCalledWith('docker', [ 'push', 'a', 'b' ], expect.anything());
    });
    it('rejects on error', async () => {
      spawnMock.mockImplementation(() => fakeProcess('error', new Error('fail')));
      await expect(dockerPush('docker', [ 'a' ])).rejects.toThrow('fail');
    });
    it('logs on ENOENT', async () => {
      spawnMock.mockImplementation(() => fakeProcess('error', Object.assign(new Error('x'), { code: 'ENOENT' })));
      void dockerPush('docker', [ 'a' ]);
      await new Promise(r => setTimeout(r, 20));
      expect(console.error).toHaveBeenCalledWith('Could not find docker');
    });
  });

  describe('dockerBuild', () => {
    it('throws without destinations', async () => {
      await expect(dockerBuild('docker', '.', [])).rejects.toThrow('At least one tag');
    });
    it('builds with args', async () => {
      spawnMock.mockReturnValue(fakeProcess('close', 0));
      await dockerBuild('docker', 'ctx', [ 't1', 't2' ], 'Dockerfile', [ 'A=1' ]);
      expect(spawnMock).toHaveBeenCalledWith('docker', [
        'build', '--file=Dockerfile', '--tag=t1', '--tag=t2', '--build-arg', 'A=1', 'ctx',
      ], expect.anything());
    });
    it('builds minimal', async () => {
      spawnMock.mockReturnValue(fakeProcess('close', 0));
      await dockerBuild('docker', 'ctx', [ 't1' ]);
      expect(spawnMock).toHaveBeenCalledWith('docker', [ 'build', '--tag=t1', 'ctx' ], expect.anything());
    });
    it('rejects on error / logs ENOENT', async () => {
      spawnMock.mockReturnValueOnce(fakeProcess('error', new Error('bad')));
      await expect(dockerBuild('docker', 'c', [ 't' ])).rejects.toThrow('bad');
      spawnMock.mockReturnValueOnce(fakeProcess('error', Object.assign(new Error('x'), { code: 'ENOENT' })));
      void dockerBuild('docker', 'c', [ 't' ]);
      await new Promise(r => setTimeout(r, 20));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loginToRegistry', () => {
    it('does nothing without credentials', async () => {
      await loginToRegistry({ command: 'docker' } as any);
      expect(spawnMock).not.toHaveBeenCalled();
    });
    it('logs in with env credentials', async () => {
      process.env['CI_REGISTRY_USER'] = 'u';
      process.env['CI_REGISTRY_PASSWORD'] = 'p';
      process.env['CI_REGISTRY'] = 'r';
      spawnMock.mockReturnValue(fakeProcess('close', 0));
      await loginToRegistry({ command: 'docker' } as any);
      expect(spawnMock).toHaveBeenCalled();
    });
  });

  describe('getFallBackImageTag', () => {
    it('uses branch with configuration suffix and sanitizes slashes', async () => {
      getCurrentBranchMock.mockResolvedValue('feat/x');
      expect(await getFallBackImageTag({ configurationName: 'dev' } as any)).toBe('feat-x-dev');
      expect(await getFallBackImageTag({} as any)).toBe('feat-x-local');
      expect(await getFallBackImageTag({ configurationName: 'production' } as any)).toBe('feat-x');
    });
    it('falls back to latest on error', async () => {
      getCurrentBranchMock.mockRejectedValue(new Error('no git'));
      expect(await getFallBackImageTag({ configurationName: 'production' } as any)).toBe('latest');
    });
  });

  describe('getGitlabRegistryDestination', () => {
    it('uses fallbacks', () => {
      expect(getGitlabRegistryDestination({}, 'img')).toBe('img:latest');
      expect(getGitlabRegistryDestination({ imageSuffix: '-s' }, 'img', undefined, 'fb')).toBe('img-s:fb');
      expect(getGitlabRegistryDestination({ imageName: 'o' }, 'img', 'tag')).toBe('o:tag');
    });
    it('prefers env', () => {
      process.env['CI_REGISTRY_IMAGE'] = 'reg/img';
      process.env['CI_COMMIT_BRANCH'] = 'main';
      process.env['REGISTRY_IMAGE_SUFFIX'] = '/x';
      expect(getGitlabRegistryDestination({}, 'img')).toBe('reg/img/x:main');
      process.env['VERSION'] = '1.0.0';
      expect(getGitlabRegistryDestination({}, 'img')).toBe('reg/img/x:1.0.0');
    });
    it('uses explicit imageName param', () => {
      expect(getGitlabRegistryDestination({}, 'img', 't', undefined, 'n', 's')).toBe('ns:t');
    });
  });

  describe('dockerSave', () => {
    it('creates dir and runs docker save', async () => {
      spawnMock.mockReturnValue(fakeProcess('close', 0));
      await dockerSave([ 'a', 'b' ], '/out/dir/x.tar.gz');
      expect(mkdirMock).toHaveBeenCalledWith('/out/dir', { recursive: true });
      expect(spawnMock).toHaveBeenCalledWith('sh', [ '-c', 'docker save a b | gzip > /out/dir/x.tar.gz' ], expect.anything());
    });
    it('rejects on error / logs ENOENT', async () => {
      spawnMock.mockReturnValueOnce(fakeProcess('error', new Error('bad')));
      await expect(dockerSave([ 'a' ], '/o/x')).rejects.toThrow('bad');
      spawnMock.mockReturnValueOnce(fakeProcess('error', Object.assign(new Error('x'), { code: 'ENOENT' })));
      void dockerSave([ 'a' ], '/o/x');
      await new Promise(r => setTimeout(r, 20));
      expect(console.error).toHaveBeenCalled();
    });
  });
});
