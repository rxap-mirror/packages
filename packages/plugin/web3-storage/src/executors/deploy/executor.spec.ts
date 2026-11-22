import { ExecutorContext } from '@nx/devkit';
import { filesFromPaths } from 'files-from-path';
import { writeFileSync } from 'fs';
import runExecutor from './executor';

const client = {
  addSpace: jest.fn(),
  setCurrentSpace: jest.fn(),
  uploadDirectory: jest.fn(),
};

jest.mock('files-from-path', () => ({ filesFromPaths: jest.fn() }));
jest.mock('fs', () => ({ ...jest.requireActual('fs'), writeFileSync: jest.fn() }));
jest.mock('@web3-storage/w3up-client', () => ({ create: jest.fn(async () => client) }), { virtual: true });
jest.mock('@web3-storage/w3up-client/proof', () => ({ parse: jest.fn(async () => ({})) }), { virtual: true });
jest.mock('@web3-storage/w3up-client/stores/memory', () => ({ StoreMemory: class {} }), { virtual: true });
jest.mock('@ucanto/principal/ed25519', () => ({ Signer: { parse: jest.fn(() => ({})) } }), { virtual: true });
jest.mock('@rxap/plugin-utilities', () => ({ GuessOutputPathFromTargetString: jest.fn(() => 'dist/app') }));

describe('web3-storage deploy executor', () => {

  const context = { root: '/ws', projectName: 'app' } as ExecutorContext;
  const savedEnv = { ...process.env };

  beforeEach(() => {
    delete process.env['WEB3_STORAGE_KEY'];
    delete process.env['WEB3_STORAGE_PROOF'];
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    (filesFromPaths as jest.Mock).mockReset().mockResolvedValue([ { name: 'index.html' } ]);
    (writeFileSync as jest.Mock).mockReset();
    client.addSpace.mockReset().mockResolvedValue({ did: () => 'did:key:1' });
    client.setCurrentSpace.mockReset().mockResolvedValue(undefined);
    client.uploadDirectory.mockReset().mockResolvedValue({ toString: () => 'bafy123' });
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    jest.restoreAllMocks();
  });

  it('should fail without key', async () => {
    expect(await runExecutor({ proof: 'p' } as any, context)).toEqual({ success: false });
  });

  it('should fail without proof', async () => {
    expect(await runExecutor({ key: 'k' } as any, context)).toEqual({ success: false });
  });

  it('should upload and write the cid', async () => {
    const result = await runExecutor({ key: 'k', proof: 'p' } as any, context);
    expect(result).toEqual({ success: true });
    expect(client.uploadDirectory).toHaveBeenCalledWith([ { name: 'index.html' } ]);
    expect(writeFileSync).toHaveBeenCalledWith('/ws/dist/app/ipfs-cid.txt', 'bafy123');
  });

  it('should read key and proof from the environment', async () => {
    process.env['WEB3_STORAGE_KEY'] = 'k';
    process.env['WEB3_STORAGE_PROOF'] = 'p';
    expect(await runExecutor({} as any, context)).toEqual({ success: true });
  });

  it('should fail if the file list can not be built', async () => {
    (filesFromPaths as jest.Mock).mockRejectedValue(new Error('x'));
    expect(await runExecutor({ key: 'k', proof: 'p' } as any, context)).toEqual({ success: false });
  });

  it('should fail if the client can not be created', async () => {
    client.addSpace.mockRejectedValue(new Error('x'));
    expect(await runExecutor({ key: 'k', proof: 'p' } as any, context)).toEqual({ success: false });
  });

  it('should fail if the upload fails', async () => {
    client.uploadDirectory.mockRejectedValue(new Error('x'));
    expect(await runExecutor({ key: 'k', proof: 'p' } as any, context)).toEqual({ success: false });
  });

  it('should fail if the cid file can not be written', async () => {
    (writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('x');
    });
    expect(await runExecutor({ key: 'k', proof: 'p' } as any, context)).toEqual({ success: false });
  });

});
