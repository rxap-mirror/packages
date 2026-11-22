import { HealthCheckError } from '@nestjs/terminus';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { OPEN_FGA_METADATA, OpenFGA } from './open-fga.decorator';
import { OpenFgaGuard, ResolveFgaChecks } from './open-fga.guard';
import { OpenFgaModule } from './open-fga.module';
import { OpenFgaModuleOptionsFactory } from './open-fga-module-options.factory';
import { OpenFgaService } from './open-fga.service';
import { OpenfgaHealthIndicator } from './openfga.health-indicator';
import { OPEN_FGA_CLIENT_OPTIONS } from './tokens';

describe('ResolveFgaChecks', () => {
  const resolve = (check: any, req: any = {}) => ResolveFgaChecks(req)(check);

  it('uses static object and relation', () => {
    expect(resolve({ relation: 'viewer', object: ['doc', '1'], user: ['user', 'u'] })).toEqual({
      user: 'user:u',
      relation: 'viewer',
      object: 'doc:1',
    });
  });

  it('resolves object from functions', () => {
    expect(resolve({ relation: 'r', object: ['doc', (r: any) => r.params.id] }, { params: { id: '5' } }).object).toBe('doc:5');
    expect(resolve({ relation: 'r', object: (r: any) => ['team', r.params.id] }, { params: { id: '7' } }).object).toBe('team:7');
  });

  describe('user', () => {
    const object: [string, string] = ['doc', '1'];

    it('defaults to the request user sub', () => {
      expect(resolve({ relation: 'r', object }, { user: { sub: 'abc' } }).user).toBe('user:abc');
    });

    it('falls back to wildcard without sub', () => {
      expect(resolve({ relation: 'r', object }, {}).user).toBe('user:*');
      expect(resolve({ relation: 'r', object }, { user: {} }).user).toBe('user:*');
      expect(resolve({ relation: 'r', object }, { user: { sub: 1 } }).user).toBe('user:*');
    });

    it('supports a function returning a tuple', () => {
      expect(resolve({ relation: 'r', object, user: () => ['group', 'g'] }).user).toBe('group:g');
      expect(resolve({ relation: 'r', object, user: () => ['group', 'g', 'member'] }).user).toBe('group:g#member');
    });

    it('supports static modifiers and function modifiers', () => {
      expect(resolve({ relation: 'r', object, user: ['group', 'g', 'member'] }).user).toBe('group:g#member');
      expect(resolve({ relation: 'r', object, user: ['group', 'g', () => 'owner'] }).user).toBe('group:g#owner');
    });

    it('supports a function for the id with optional modifier', () => {
      expect(resolve({ relation: 'r', object, user: ['group', () => 'g'] }).user).toBe('group:g');
      expect(resolve({ relation: 'r', object, user: ['group', () => ['g', 'm']] }).user).toBe('group:g#m');
    });
  });
});

describe('OpenFgaGuard', () => {
  let guard: OpenFgaGuard;
  let reflector: { getAllAndOverride: jest.Mock; get: jest.Mock };
  let fga: { clientBatchCheck: jest.Mock };
  let logger: Record<string, jest.Mock>;
  const ctx = (req: any = { user: { sub: 'u' } }): any => ({
    getHandler: () => 'h',
    getClass: () => 'c',
    switchToHttp: () => ({ getRequest: () => req }),
  });

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false), get: jest.fn() };
    fga = { clientBatchCheck: jest.fn() };
    logger = { verbose: jest.fn(), debug: jest.fn(), warn: jest.fn() };
    guard = new OpenFgaGuard(reflector as any);
    Object.assign(guard as any, { fga, logger });
  });

  it('allows public routes', async () => {
    reflector.getAllAndOverride.mockImplementation((k) => k === IS_PUBLIC_KEY);
    await expect(guard.canActivate(ctx())).resolves.toBe(true);
    expect(fga.clientBatchCheck).not.toHaveBeenCalled();
  });

  it('allows routes without checks', async () => {
    reflector.get.mockReturnValue(undefined);
    await expect(guard.canActivate(ctx())).resolves.toBe(true);
    reflector.get.mockReturnValue([]);
    await expect(guard.canActivate(ctx())).resolves.toBe(true);
  });

  it('allows when every tuple is allowed', async () => {
    reflector.get.mockReturnValue([{ relation: 'viewer', object: ['doc', '1'] }]);
    fga.clientBatchCheck.mockResolvedValue({ result: [{ allowed: true }] });
    await expect(guard.canActivate(ctx())).resolves.toBe(true);
    expect(reflector.get).toHaveBeenCalledWith(OPEN_FGA_METADATA, 'h');
    expect(fga.clientBatchCheck).toHaveBeenCalledWith([{ user: 'user:u', relation: 'viewer', object: 'doc:1' }]);
  });

  it('denies when any tuple is not allowed', async () => {
    reflector.get.mockReturnValue([
      { relation: 'a', object: ['d', '1'] },
      { relation: 'b', object: ['d', '2'] },
    ]);
    fga.clientBatchCheck.mockResolvedValue({ result: [{ allowed: true }, { allowed: false }] });
    await expect(guard.canActivate(ctx())).resolves.toBe(false);
    expect(logger['warn']).toHaveBeenCalled();
  });

  it('OpenFGA decorator stores checks', () => {
    const check = { relation: 'r', object: ['a', 'b'] as [string, string] };
    class T {
      @OpenFGA(check)
      m() {}
    }
    expect(Reflect.getMetadata(OPEN_FGA_METADATA, T.prototype.m)).toEqual([check]);
  });
});

describe('OpenfgaHealthIndicator', () => {
  let indicator: OpenfgaHealthIndicator;
  let openfga: { checkValidApiConnection: jest.Mock };
  let logger: Record<string, jest.Mock>;
  let env: Record<string, any>;

  beforeEach(() => {
    env = { FGA_STORE_ID: 's', FGA_AUTHORIZATION_MODEL_ID: 'm' };
    openfga = { checkValidApiConnection: jest.fn().mockResolvedValue(undefined) };
    logger = { error: jest.fn() };
    indicator = new OpenfgaHealthIndicator();
    Object.assign(indicator as any, { openfga, logger, config: { get: (k: string) => env[k] } });
  });

  it('is healthy when the connection check passes', async () => {
    await expect(indicator.isHealthy()).resolves.toEqual({ openfga: { status: 'up' } });
    expect(openfga.checkValidApiConnection).toHaveBeenCalledWith({ storeId: 's', authorizationModelId: 'm' });
  });

  it('fails without store id or model id', async () => {
    delete env['FGA_STORE_ID'];
    await expect(indicator.isHealthy()).rejects.toThrow('FGA_STORE_ID not set!');
    env['FGA_STORE_ID'] = 's';
    delete env['FGA_AUTHORIZATION_MODEL_ID'];
    await expect(indicator.isHealthy()).rejects.toThrow('FGA_AUTHORIZATION_MODEL_ID not set!');
  });

  it('logs connection errors unless silent', async () => {
    openfga.checkValidApiConnection.mockRejectedValue(new Error('down'));
    await expect(indicator.isHealthy()).rejects.toBeInstanceOf(HealthCheckError);
    expect(logger['error']).toHaveBeenCalledWith(expect.stringContaining('down'), 'OpenfgaHealthIndicator');
    logger['error'].mockClear();
    await expect(indicator.isHealthy(true)).rejects.toBeInstanceOf(HealthCheckError);
    expect(logger['error']).not.toHaveBeenCalled();
  });
});

describe('OpenFgaModuleOptionsFactory', () => {
  const create = (env: Record<string, any>) => {
    const f = new OpenFgaModuleOptionsFactory();
    Object.assign(f as any, {
      logger: { verbose: jest.fn() },
      config: {
        get: (k: string) => env[k],
        getOrThrow: (k: string) => {
          if (!(k in env)) throw new Error(`missing ${k}`);
          return env[k];
        },
      },
    });
    return f.create();
  };

  it('requires FGA_API_URL', async () => {
    await expect(create({})).rejects.toThrow('missing FGA_API_URL');
  });

  it('builds minimal options', async () => {
    const o = await create({ FGA_API_URL: 'http://f' });
    expect(o).toEqual({ apiUrl: 'http://f', retryInterval: undefined, maxStartupTime: undefined });
  });

  it('adds store, model and token credentials', async () => {
    const o: any = await create({
      FGA_API_URL: 'http://f',
      FGA_STORE_ID: 's',
      FGA_AUTHORIZATION_MODEL_ID: 'm',
      FGA_API_TOKEN: 't',
      FGA_INITIAL_CONNECTION_RETRY_INTERVAL: 5,
    });
    expect(o).toMatchObject({ storeId: 's', authorizationModelId: 'm', retryInterval: 5 });
    expect(o.credentials.config.token).toBe('t');
  });
});

describe('OpenFgaService', () => {
  it('is an OpenFgaClient configured from options', () => {
    const s = new OpenFgaService({ apiUrl: 'http://localhost:8080' } as any);
    expect(s.storeId).toBeUndefined();
    expect(typeof s.clientBatchCheck).toBe('function');
  });
});

describe('OpenFgaModule', () => {
  it('register adds the options alias', () => {
    const m = OpenFgaModule.register({ apiUrl: 'http://x' } as any);
    expect(m.providers!.some((p: any) => p.provide === OPEN_FGA_CLIENT_OPTIONS)).toBe(true);
    const a = OpenFgaModule.registerAsync({ useFactory: () => ({ apiUrl: 'x' }) as any });
    expect(a.providers!.some((p: any) => p.provide === OPEN_FGA_CLIENT_OPTIONS)).toBe(true);
  });

  describe('onApplicationBootstrap', () => {
    const make = (options: any, isHealthy: jest.Mock) => {
      const m = new OpenFgaModule();
      Object.assign(m as any, {
        options,
        openfgaHealthIndicator: { isHealthy },
        logger: { debug: jest.fn(), log: jest.fn(), warn: jest.fn() },
      });
      return m;
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('returns as soon as openfga is up', async () => {
      const healthy = jest.fn().mockResolvedValue({ openfga: { status: 'up' } });
      const m = make({}, healthy);
      await m.onApplicationBootstrap();
      expect(healthy).toHaveBeenCalledTimes(1);
      expect(healthy).toHaveBeenCalledWith(true);
    });

    it('retries until healthy', async () => {
      const healthy = jest
        .fn()
        .mockRejectedValueOnce(new Error('nope'))
        .mockResolvedValue({ openfga: { status: 'up' } });
      const m = make({ retryInterval: 10, maxStartupTime: 100 }, healthy);
      const p = m.onApplicationBootstrap();
      await jest.advanceTimersByTimeAsync(10);
      await p;
      expect(healthy).toHaveBeenCalledTimes(2);
      expect((m as any).logger.warn).toHaveBeenCalled();
    });

    it('gives up after maxRetry attempts', async () => {
      const healthy = jest.fn().mockResolvedValue({ openfga: { status: 'down' } });
      const m = make({ retryInterval: 10, maxStartupTime: 30 }, healthy);
      const p = m.onApplicationBootstrap();
      await jest.advanceTimersByTimeAsync(100);
      await p;
      expect(healthy).toHaveBeenCalledTimes(3);
    });
  });
});
