import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { EventEmitter } from 'events';
import { tmpdir } from 'os';
import { join } from 'path';

jest.mock('os', () => {
  const actual = jest.requireActual('os');
  const dir = jest
    .requireActual('fs')
    .mkdtempSync(jest.requireActual('path').join(actual.tmpdir(), 'node-utils-pkg-'));
  return { ...actual, tmpdir: () => dir };
});
jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('https', () => ({ get: jest.fn() }));

import { exec } from 'child_process';
let get: jest.Mock;

describe('GetCurrentBranch', () => {
  const { GetCurrentBranch } = require('./get-current-branch');
  const script = (...results: Array<[Error | null, string]>) => {
    (exec as unknown as jest.Mock).mockReset();
    for (const [err, out] of results) {
      (exec as unknown as jest.Mock).mockImplementationOnce((_cmd: string, cb: any) => cb(err, out, ''));
    }
  };

  it('resolves the branch name', async () => {
    script([null, 'true\n'], [null, 'main\n']);
    await expect(GetCurrentBranch()).resolves.toBe('main');
  });

  it('rejects outside of a repository', async () => {
    script([new Error('x'), '']);
    await expect(GetCurrentBranch()).rejects.toThrow('not a git repository');
    script([null, 'false']);
    await expect(GetCurrentBranch()).rejects.toThrow('not a git repository');
  });

  it('rejects for a detached HEAD', async () => {
    script([null, 'true'], [new Error('x'), '']);
    await expect(GetCurrentBranch()).rejects.toThrow('HEAD is not pointing');
  });
});

describe('GetPackageInfo / GetPackagePeerDependencies / GetLatestPackageVersion', () => {
  const respond = (body: string | Error) => {
    get.mockImplementationOnce((_url: string, cb: any) => {
      const req = new EventEmitter();
      setTimeout(() => {
        if (body instanceof Error) {
          req.emit('error', body);
          return;
        }
        const res = new EventEmitter();
        cb(res);
        res.emit('data', body.slice(0, 3));
        res.emit('data', body.slice(3));
        res.emit('end');
      }, 0);
      return req;
    });
  };

  let info: typeof import('./get-package-info');
  let peers: typeof import('./get-package-peer-dependencies');
  let latest: typeof import('./get-latest-package-version');

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    delete process.env['NX_WORKSPACE_ROOT'];
    load();
  });
  afterEach(() => jest.restoreAllMocks());

  const load = () => {
    jest.isolateModules(() => {
      get = require('https').get;
      info = require('./get-package-info');
      peers = require('./get-package-peer-dependencies');
      latest = require('./get-latest-package-version');
    });
  };

  it('fetches, caches on disk and in memory', async () => {
    load();
    const pkg = { 'dist-tags': { latest: '1.2.3' }, versions: { '1.2.3': { peerDependencies: { a: '^1' } } } };
    respond(JSON.stringify(pkg));
    expect(await info.GetPackageInfo('@scope/name', true)).toEqual(pkg);
    expect(await info.GetPackageInfo('@scope/name')).toEqual(pkg);
    expect(get).toHaveBeenCalledTimes(1);
    expect(await peers.GetPackagePeerDependencies('@scope/name', '1.2.3')).toEqual({ a: '^1' });
    expect(await peers.GetPackagePeerDependencies('@scope/name', '9.9.9')).toEqual({});
    // disk cache is picked up after reloading
    load();
    expect(await info.GetPackageInfo('@scope/name')).toEqual(pkg);
    expect(get).not.toHaveBeenCalled();
  });

  it('resolves null for registry errors, invalid json and network errors', async () => {
    load();
    respond('{"error":"Not found"}');
    expect(await info.GetPackageInfo('missing-1', true)).toBeNull();
    respond('not json');
    expect(await info.GetPackageInfo('missing-2', true)).toBeNull();
    respond(new Error('offline'));
    expect(await info.GetPackageInfo('missing-3', true)).toBeNull();
    expect(console.error).toHaveBeenCalledTimes(3);
    respond('{"error":"x"}');
    expect(await peers.GetPackagePeerDependencies('missing-4', 'latest', true)).toEqual({});
  });

  it('determines the latest version from the registry and caches it', async () => {
    load();
    respond(JSON.stringify({ 'dist-tags': { latest: '2.0.0' }, versions: {} }));
    expect(await latest.GetLatestPackageVersion('pkg-latest', true)).toBe('2.0.0');
    expect(await latest.GetLatestPackageVersion('pkg-latest')).toBe('2.0.0');
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('returns null if the registry has no info and throws for invalid info', async () => {
    load();
    respond('{"error":"x"}');
    expect(await latest.GetLatestPackageVersion('pkg-none', true)).toBeNull();
    respond(JSON.stringify({ versions: {} }));
    await expect(latest.GetLatestPackageVersion('pkg-invalid', true)).rejects.toThrow('Invalid package info');
  });

  it('uses the version of the rxap package group when available', async () => {
    const ws = mkdtempSync(join(tmpdir(), 'ws-'));
    mkdirSync(join(ws, 'node_modules', 'rxap'), { recursive: true });
    writeFileSync(
      join(ws, 'node_modules', 'rxap', 'package.json'),
      JSON.stringify({ 'nx-migrations': { packageGroup: [{ package: 'grouped', version: '7.7.7' }] } }),
    );
    process.env['NX_WORKSPACE_ROOT'] = ws;
    load();
    expect(await latest.GetLatestPackageVersion('grouped', true)).toBe('7.7.7');
    expect(get).not.toHaveBeenCalled();
    respond(JSON.stringify({ 'dist-tags': { latest: '3.0.0' }, versions: {} }));
    expect(await latest.GetLatestPackageVersion('not-grouped', true)).toBe('3.0.0');
  });
});
