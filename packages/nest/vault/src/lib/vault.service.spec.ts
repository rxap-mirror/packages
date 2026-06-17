import { VaultService } from './vault.service';

function createLogger(): any {
  return {
    verbose: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  };
}

describe('VaultService', () => {

  describe('when disabled', () => {

    it('should reject operations instead of hanging', async () => {
      const config: any = {
        get: jest.fn((key: string) => (key === 'VAULT_DISABLED' ? 'true' : undefined)),
        getOrThrow: jest.fn(),
      };
      const service = new VaultService(
        { apiVersion: 'v1', endpoint: 'http://localhost:8200' } as any,
        config,
        createLogger(),
      );

      await expect(service.read('secret/data/foo')).rejects.toThrow('Vault is disabled');
      await expect(service.write('secret/data/foo', {})).rejects.toThrow('Vault is disabled');
    });

  });

  describe('auto renew timeout', () => {

    it('should schedule renewal using a millisecond timeout', async () => {
      const config: any = {
        get: jest.fn(() => undefined),
        getOrThrow: jest.fn(),
      };
      const service = new VaultService(
        { token: 'test-token', apiVersion: 'v1', endpoint: 'http://localhost:8200' } as any,
        config,
        createLogger(),
      );

      const renewedClient: any = {
        token: '',
        tokenRenewSelf: jest.fn().mockResolvedValue({
          auth: { client_token: 'renewed' },
          lease_duration: 3600,
        }),
      };
      (service as any).client = renewedClient;

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((() => 0) as any);

      await service.tokenRenewSelf({}, true);

      // 3600s lease * 0.6 = 2160s = 2_160_000 ms (above the 10 min minimum)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3600 * 0.6 * 1000);

      setTimeoutSpy.mockRestore();
    });

  });

});
