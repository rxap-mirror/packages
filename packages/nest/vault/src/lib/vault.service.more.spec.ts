import { VaultService } from './vault.service';

const mockClient: any = {};
jest.mock('node-vault', () => jest.fn(() => mockClient));

const mockFs = { exists: false, content: '' };
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(() => mockFs.exists),
  readFileSync: jest.fn(() => mockFs.content),
}));

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

function createConfig(env: Record<string, unknown> = {}): any {
  return {
    get: jest.fn((k: string) => env[k]),
    getOrThrow: jest.fn((k: string) => {
      if (env[k] === undefined) throw new Error(`missing ${k}`);
      return env[k];
    }),
  };
}

const flush = () => new Promise((r) => setImmediate(r));

function create(options: any = {}, env: Record<string, unknown> = {}, logger = createLogger()) {
  const service = new VaultService(options, createConfig(env), logger);
  return { service, logger };
}

describe('VaultService (enabled)', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockClient)) delete mockClient[k];
    Object.assign(mockClient, {
      token: '',
      help: jest.fn().mockResolvedValue('help'),
      write: jest.fn().mockResolvedValue('write'),
      read: jest.fn().mockResolvedValue('read'),
      list: jest.fn().mockResolvedValue('list'),
      delete: jest.fn().mockResolvedValue('delete'),
      request: jest.fn().mockResolvedValue('request'),
      tokenRenewSelf: jest.fn(),
      tokenLookupSelf: jest.fn().mockResolvedValue('lookup'),
      kubernetesLogin: jest.fn(),
    });
    mockFs.exists = false;
    mockFs.content = '';
  });

  describe('token from options / env', () => {
    it('uses the option token and delegates operations', async () => {
      const { service } = create({ token: 'opt' });
      await expect(service.read('p', { a: 1 } as any)).resolves.toBe('read');
      expect(mockClient.token).toBe('opt');
      expect(mockClient.read).toHaveBeenCalledWith('p', { a: 1 });
      await expect(service.write('p', { d: 1 })).resolves.toBe('write');
      expect(mockClient.write).toHaveBeenCalledWith('p', { d: 1 }, {});
      await expect(service.list('p')).resolves.toBe('list');
      await expect(service.delete('p')).resolves.toBe('delete');
      await expect(service.help('p')).resolves.toBe('help');
      await expect(service.tokenLookupSelf()).resolves.toBe('lookup');
    });

    it('uses VAULT_TOKEN from config', async () => {
      const { service } = create({}, { VAULT_TOKEN: 'env' });
      await service.read('p');
      expect(mockClient.token).toBe('env');
    });

    it('renewLease posts to the leases endpoint', async () => {
      const { service } = create({ token: 't' });
      await service.renewLease({ lease_id: 'l', increment: '1h' });
      expect(mockClient.request).toHaveBeenCalledWith({
        path: '/sys/leases/renew',
        method: 'POST',
        json: { lease_id: 'l', increment: '1h' },
      });
    });

    it('treats VAULT_DISABLED=true (boolean) as disabled', async () => {
      const { service } = create({}, { VAULT_DISABLED: true });
      await expect(service.list('p')).rejects.toThrow('Vault is disabled');
    });
  });

  describe('tokenRenewSelf', () => {
    it('updates the token and does not schedule without autoRenew', async () => {
      const spy = jest.spyOn(global, 'setTimeout');
      const { service } = create({ token: 't' });
      mockClient.tokenRenewSelf.mockResolvedValue({ auth: { client_token: 'new' }, lease_duration: 10 });
      await service.tokenRenewSelf({ increment: '1h' });
      expect(mockClient.token).toBe('new');
      expect(mockClient.tokenRenewSelf).toHaveBeenCalledWith({ increment: '1h' });
      expect(spy.mock.calls.filter(([, t]) => t === 6000)).toHaveLength(0);
      spy.mockRestore();
    });

    it('wraps client errors', async () => {
      const { service, logger } = create({ token: 't' });
      mockClient.tokenRenewSelf.mockRejectedValue(new Error('net'));
      await expect(service.tokenRenewSelf({})).rejects.toThrow(
        "Failed to renew vault token with increment 'default': net",
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('fails when the response has no client token', async () => {
      const { service, logger } = create({ token: 't' });
      mockClient.tokenRenewSelf.mockResolvedValue({ auth: null, lease_duration: 1 });
      await expect(service.tokenRenewSelf({ increment: '2h' })).rejects.toThrow(/did not contain a client token/);
      expect(logger.fatal).toHaveBeenCalled();
    });

    it('enforces a minimum auto renew timeout of 10 minutes', async () => {
      const spy = jest.spyOn(global, 'setTimeout').mockImplementation((() => 0) as any);
      const { service, logger } = create({ token: 't' });
      mockClient.tokenRenewSelf.mockResolvedValue({ auth: { client_token: 'n' }, lease_duration: 60 });
      await service.tokenRenewSelf({}, true);
      expect(spy).toHaveBeenCalledWith(expect.any(Function), 600000);
      expect(logger.warn).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('kubernetes auth', () => {
    const login = (token = 'k8s', lease = 3600) =>
      mockClient.kubernetesLogin.mockResolvedValue({ auth: { client_token: token, lease_duration: lease } });

    it('logs in using options', async () => {
      login();
      const { service } = create({
        kubernetesAuth: { role: 'r', jwt: 'j', path: 'p', autoRenew: false },
      });
      await service.read('x');
      expect(mockClient.kubernetesLogin).toHaveBeenCalledWith({ role: 'r', jwt: 'j', kubernetesPath: 'p' });
      expect(mockClient.token).toBe('k8s');
    });

    it('falls back to env for role, jwt, path and auto renew', async () => {
      login();
      const spy = jest.spyOn(global, 'setTimeout').mockImplementation((() => 0) as any);
      const { service } = create(
        { kubernetesAuth: true },
        {
          VAULT_KUBERNETES_ROLE: 'envrole',
          VAULT_KUBERNETES_JWT: 'envjwt',
          VAULT_KUBERNETES_PATH: 'envpath',
          VAULT_KUBERNETES_AUTO_RENEW: 'true',
        },
      );
      await service.read('x');
      expect(mockClient.kubernetesLogin).toHaveBeenCalledWith({
        role: 'envrole',
        jwt: 'envjwt',
        kubernetesPath: 'envpath',
      });
      expect(spy).toHaveBeenCalledWith(expect.any(Function), 3600 * 0.6 * 1000);
      spy.mockRestore();
    });

    it('uses VAULT_KUBERNETES_ROLE alone to enable kubernetes auth, reading the jwt from the service account file', async () => {
      login();
      mockFs.exists = true;
      mockFs.content = 'filejwt';
      const { service } = create({}, { VAULT_KUBERNETES_ROLE: 'r' });
      await service.read('x');
      expect(mockClient.kubernetesLogin).toHaveBeenCalledWith({
        role: 'r',
        jwt: 'filejwt',
        kubernetesPath: undefined,
      });
    });

    it('rejects when the login response has no auth', async () => {
      mockClient.kubernetesLogin.mockResolvedValue({ auth: null });
      const { service } = create({ kubernetesAuth: { role: 'r', jwt: 'j' } });
      await expect(service.read('x')).rejects.toThrow(/did not contain an auth object/);
    });

    it('rejects when no role is available', async () => {
      const { service } = create({ kubernetesAuth: { jwt: 'j' } });
      await expect(service.read('x')).rejects.toThrow(/requires a role/);
    });

    it('rejects when no jwt is available', async () => {
      const { service } = create({ kubernetesAuth: { role: 'r' } });
      await expect(service.read('x')).rejects.toThrow(/requires a jwt token/);
    });
  });

  it('rejects operations when no authentication method is configured', async () => {
    const { service } = create({});
    await expect(service.read('x')).rejects.toThrow('No authentication method provided for vault');
  });
});
