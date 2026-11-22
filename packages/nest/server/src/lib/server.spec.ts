import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENVIRONMENT_PREPARED } from '@rxap/nest-utilities';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));
import { Server } from './server';

class TestServer extends Server<any, any, any, any> {
  public created: any = {
    get: jest.fn(),
    useLogger: jest.fn(),
    close: jest.fn(),
  };
  public order: string[] = [];
  protected create() {
    this.order.push('create');
    return Promise.resolve(this.created);
  }
  protected prepareOptions() {
    this.order.push('options');
    return { x: 1 };
  }
  protected listen() {
    this.order.push('listen');
    return Promise.resolve();
  }
}

describe('Server', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    for (const m of ['log', 'debug', 'warn', 'error', 'verbose']) {
      jest.spyOn(Logger, m as any).mockImplementation(() => undefined);
    }
  });
  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...origEnv };
  });

  describe('prepareEnvironment', () => {
    const prep = (env: any, vars: Record<string, string | undefined> = {}) => {
      delete process.env['ENVIRONMENT'];
      delete process.env['ENVIRONMENT_NAME'];
      delete process.env['ENVIRONMENT_TIER'];
      delete process.env['PRODUCTION'];
      delete process.env['NODE_ENV'];
      delete process.env['CI'];
      Object.assign(process.env, vars);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      return Server.prepareEnvironment(env);
    };

    it('overrides values from process.env', () => {
      const env: any = { name: 'a', tier: 't', production: false };
      prep(env, {
        ENVIRONMENT: 'e1',
        ENVIRONMENT_NAME: 'e2',
        ENVIRONMENT_TIER: 'prod',
        PRODUCTION: 'true',
        CI: 'true',
      });
      expect(env).toMatchObject({ name: 'e2', tier: 'prod', production: true, ci: true });
      expect(env[ENVIRONMENT_PREPARED]).toBe(true);
      expect(process.env['NODE_ENV']).toBe('production');
    });

    it('sets NODE_ENV to development for non production', () => {
      prep({ production: false });
      expect(process.env['NODE_ENV']).toBe('development');
    });

    it('keeps an existing NODE_ENV', () => {
      prep({ production: true }, { NODE_ENV: 'test' });
      expect(process.env['NODE_ENV']).toBe('test');
    });

    it('treats PRODUCTION other than true as false', () => {
      const env: any = { production: true };
      prep(env, { PRODUCTION: 'no' });
      expect(env.production).toBe(false);
    });

    it('is idempotent', () => {
      const env: any = { production: false };
      prep(env, { ENVIRONMENT: 'first' });
      process.env['ENVIRONMENT'] = 'second';
      Server.prepareEnvironment(env);
      expect(env.name).toBe('first');
    });

    it('merges build.json when present', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('{"version":"1.2.3"}'));
      const env: any = {};
      Server.prepareEnvironment(env);
      expect(env.version).toBe('1.2.3');
    });

    it('warns on an invalid build.json', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('{nope'));
      Server.prepareEnvironment({} as any);
      expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Could not parse build.json'), 'Bootstrap');
    });
  });

  describe('bootstrap', () => {
    let server: TestServer;
    let logger: any;
    let config: any;

    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      logger = { log: jest.fn(), warn: jest.fn() };
      config = { get: jest.fn() };
      server = new TestServer(class M {}, { name: 'n', production: false, [ENVIRONMENT_PREPARED]: true } as any);
      server.created.get.mockImplementation((t: any) => (t === ConfigService ? config : logger));
    });

    it('runs hooks in order and returns the app', async () => {
      server.before(() => void server.order.push('before'));
      server.after(() => void server.order.push('after'));
      server.ready(() => void server.order.push('ready'));
      const app = await server.bootstrap();
      expect(app).toBe(server.created);
      expect(server.order).toEqual(['before', 'create', 'options', 'after', 'listen', 'ready']);
      expect(server.created.useLogger).toHaveBeenCalledWith(logger);
      expect(server.config).toBe(config);
    });

    it('passes options and environment to hooks bound to the server', async () => {
      const after = jest.fn(function (this: any) {
        return this;
      });
      server.after(after);
      await server.bootstrap();
      expect(after.mock.calls[0]).toEqual([server.created, config, logger, { x: 1 }, server.environment]);
      expect(after.mock.results[0].value).toBe(server);
    });

    it('supports a custom logger instance and factory', async () => {
      const custom = { log: jest.fn(), warn: jest.fn() };
      server.useLogger(custom as any);
      await server.bootstrap();
      expect(server.logger).toBe(custom);
      const factory = jest.fn().mockResolvedValue(logger);
      server.useLogger(factory);
      await server.bootstrap();
      expect(factory).toHaveBeenCalledWith(server.created, config, server.environment);
    });

    it('warns when ENVIRONMENT_NAME differs', async () => {
      config.get.mockReturnValue('other');
      await server.bootstrap();
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('ENVIRONMENT_NAME'), 'Bootstrap');
    });

    it('fails when creation, config or logger are missing', async () => {
      server.created = null;
      await expect(server.bootstrap()).rejects.toThrow('creation failed');
      server.created = { get: jest.fn().mockReturnValue(null) };
      await expect(server.bootstrap()).rejects.toThrow('ConfigService');
      server.created = { get: jest.fn((t: any) => (t === ConfigService ? config : null)) };
      server.useLogger(null as any);
      await expect(server.bootstrap()).rejects.toThrow('Logger');
    });

    it('closes the app', () => {
      server.app = server.created;
      server.close();
      expect(server.created.close).toHaveBeenCalled();
      new TestServer(class M {}, {} as any).close();
    });

    it('prints package versions and tolerates parse errors', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const read = (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('{"dependencies":{"a":"1"}}'));
      (server as any).printPackageVersions();
      expect(Logger.debug).toHaveBeenCalledWith(expect.stringContaining('"a"'), 'Bootstrap');
      read.mockReturnValue(Buffer.from('x'));
      (server as any).printPackageVersions();
      expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Could not parse package.json'), 'Bootstrap');
    });
  });
});
