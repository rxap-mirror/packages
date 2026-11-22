import { RabbitmqVaultOptionsFactory } from './rabbitmq-vault-options-factory';
import { RabbitmqVaultService } from './rabbitmq-vault.service';

describe('RabbitmqVaultService', () => {
  let service: RabbitmqVaultService;
  let vault: { read: jest.Mock; renewLease: jest.Mock };
  let logger: any;

  beforeEach(() => {
    jest.useFakeTimers();
    vault = { read: jest.fn(), renewLease: jest.fn() };
    logger = { debug: jest.fn(), fatal: jest.fn(), error: jest.fn(), log: jest.fn() };
    service = new RabbitmqVaultService();
    Object.assign(service as any, {
      vault,
      logger,
      config: { getOrThrow: jest.fn().mockReturnValue('role-cfg') },
    });
  });
  afterEach(() => jest.useRealTimers());

  it('reads credentials for the configured role', async () => {
    vault.read.mockResolvedValue({ data: { username: 'u', password: 'p' }, lease_id: 'l', lease_duration: 10, renewable: true });
    await expect(service.getCredentials()).resolves.toEqual({ username: 'u', password: 'p' });
    expect(vault.read).toHaveBeenCalledWith('rabbitmq/creds/role-cfg');
  });

  it('throws when vault returns no data', async () => {
    vault.read.mockResolvedValue({});
    await expect(service.getCredentials('r')).rejects.toThrow('No data returned');
    expect(logger.fatal).toHaveBeenCalled();
  });

  it('maps a sealed vault to a dedicated error', async () => {
    vault.read.mockRejectedValue({ status: 503, message: 'Vault is sealed' });
    await expect(service.getCredentials('r')).rejects.toThrow('Vault is sealed');
  });

  it('rethrows other errors untouched', async () => {
    const err = { status: 503, message: 'other' };
    vault.read.mockRejectedValue(err);
    await expect(service.getCredentials('r')).rejects.toBe(err);
  });

  it('auto renews the lease when requested', async () => {
    vault.read.mockResolvedValue({ data: { username: 'u', password: 'p' }, lease_id: 'l', lease_duration: 100, renewable: true });
    vault.renewLease.mockResolvedValue({ lease_id: 'l2', lease_duration: 100, renewable: false });
    await service.getCredentials('r', true);
    jest.advanceTimersByTime(90_000);
    expect(vault.renewLease).toHaveBeenCalledWith({ lease_id: 'l' });
    await Promise.resolve();
    await Promise.resolve();
    // second lease is not renewable
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("'l2'"), 'RabbitmqVaultService');
  });

  it('logs when the lease is not renewable', () => {
    service.autoRenewLease('l', 10, false);
    expect(logger.error).toHaveBeenCalled();
    expect(vault.renewLease).not.toHaveBeenCalled();
  });

  it('caps the renewal timeout', () => {
    const spy = jest.spyOn(global, 'setTimeout');
    service.autoRenewLease('l', 10_000_000, true);
    expect(spy.mock.calls[0][1]).toBe(2_147_483_647 - 1);
  });
});

describe('RabbitmqVaultOptionsFactory', () => {
  const build = (base: any, role: string | undefined) => {
    const f = new RabbitmqVaultOptionsFactory();
    const vault = { getCredentials: jest.fn().mockResolvedValue({ username: 'v', password: 'w' }) };
    Object.assign(f as any, {
      vault,
      logger: { debug: jest.fn() },
      config: {
        get: jest.fn(() => role),
        getOrThrow: jest.fn(() => role),
      },
    });
    jest
      .spyOn(Object.getPrototypeOf(RabbitmqVaultOptionsFactory.prototype), 'getCredentials')
      .mockResolvedValue(base);
    return { f, vault };
  };
  afterEach(() => jest.restoreAllMocks());

  it('prefers configured credentials', async () => {
    const { f, vault } = build({ username: 'a', password: 'b' }, 'role');
    await expect(f.getCredentials()).resolves.toEqual({ username: 'a', password: 'b' });
    expect(vault.getCredentials).not.toHaveBeenCalled();
  });

  it('falls back to vault with renewal', async () => {
    const { f, vault } = build(null, 'role');
    await expect(f.getCredentials()).resolves.toEqual({ username: 'v', password: 'w' });
    expect(vault.getCredentials).toHaveBeenCalledWith('role', true);
  });

  it('returns null without a role', async () => {
    const { f } = build(null, undefined);
    await expect(f.getCredentials()).resolves.toBeNull();
  });
});
