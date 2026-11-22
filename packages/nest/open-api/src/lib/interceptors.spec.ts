import { CallHandler, HttpStatus } from '@nestjs/common';
import { ValidationHttpException } from '@rxap/nest-utilities';
import { IsString } from 'class-validator';
import { lastValueFrom, of, throwError } from 'rxjs';
import { DefaultUpstreamInterceptor } from './default.upstream-interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { ValidatorInterceptor } from './validator.interceptor';
import { OptionsDtoSchema, OptionsDtoSchemaFactory } from './options.dto';
import { GetOpenapiJson } from './get-openapi-json';
import * as fs from 'fs';
import {
  OpenApiModule,
  OpenApiServerConfigFactory,
  OpenApiUpstreamInterceptorFactory,
} from './open-api.module';
import { OPEN_API_SERVER_CONFIG, OPEN_API_UPSTREAM_INTERCEPTOR } from './open-api-operation/tokens';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

class Dto {
  @IsString()
  name!: string;
}

const ctx = (className: string, req: any = { method: 'get', url: '/x', body: { a: 1 } }, type = 'http'): any => ({
  getType: () => type,
  getClass: () => ({ name: className }),
  switchToHttp: () => ({ getRequest: () => req }),
});
const handler = (obs: any): CallHandler => ({ handle: () => obs });
const mkLogger = () => ({ debug: jest.fn(), verbose: jest.fn(), error: jest.fn(), warn: jest.fn() });

describe('LoggingInterceptor', () => {
  let i: LoggingInterceptor;
  let logger: ReturnType<typeof mkLogger>;
  beforeEach(() => {
    i = new LoggingInterceptor();
    logger = mkLogger();
    (i as any).logger = logger;
  });

  it('skips non http contexts and health/app controllers', async () => {
    for (const c of [ctx('X', {}, 'rpc'), ctx('HealthController'), ctx('AppController')]) {
      await lastValueFrom(i.intercept(c, handler(of(1))));
    }
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('logs request, success and body', async () => {
    await lastValueFrom(i.intercept(ctx('Ctl'), handler(of({ r: 1 }))));
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('GET /x'), 'Ctl');
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('SUCCESS GET /x'), 'Ctl');
    expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining('REQUEST {"a":1}'), 'Ctl');
    expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining('RESPONSE {"r":1}'), 'Ctl');
  });

  it('logs empty responses and failures', async () => {
    await lastValueFrom(i.intercept(ctx('Ctl', { method: 'get', url: '/x' }), handler(of(undefined))));
    expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining('<empty>'), 'Ctl');
    await expect(lastValueFrom(i.intercept(ctx('Ctl'), handler(throwError(() => new Error('bad')))))).rejects.toThrow('bad');
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('FAILURE bad'), 'Ctl');
  });
});

describe('ValidatorInterceptor', () => {
  let i: ValidatorInterceptor;
  let logger: ReturnType<typeof mkLogger>;
  beforeEach(() => {
    i = new ValidatorInterceptor();
    logger = mkLogger();
    (i as any).logger = logger;
  });

  const valid = () => Object.assign(new Dto(), { name: 'n' });
  const invalid = () => new Dto();

  it('skips non http and excluded controllers', async () => {
    await expect(lastValueFrom(i.intercept(ctx('X', {}, 'rpc'), handler(of(invalid()))))).resolves.toBeDefined();
    await expect(lastValueFrom(i.intercept(ctx('HealthController'), handler(of(invalid()))))).resolves.toBeDefined();
  });

  it('passes valid, empty and array responses', async () => {
    await expect(lastValueFrom(i.intercept(ctx('C'), handler(of(valid()))))).resolves.toBeDefined();
    await expect(lastValueFrom(i.intercept(ctx('C'), handler(of(null))))).resolves.toBeNull();
    await expect(lastValueFrom(i.intercept(ctx('C'), handler(of([valid(), valid()]))))).resolves.toHaveLength(2);
  });

  it('rejects invalid single responses with a 500 validation exception', async () => {
    const e = await lastValueFrom(i.intercept(ctx('C'), handler(of(invalid())))).catch((x) => x);
    expect(e).toBeInstanceOf(ValidationHttpException);
    expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(logger.error).toHaveBeenCalled();
  });

  it('rejects arrays containing invalid items', async () => {
    const e = await lastValueFrom(i.intercept(ctx('C'), handler(of([valid(), invalid(), invalid()])))).catch((x) => x);
    expect(e).toBeInstanceOf(ValidationHttpException);
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});

describe('DefaultUpstreamInterceptor', () => {
  const make = (header: string | undefined, env: Record<string, string> = {}) => {
    const i = new DefaultUpstreamInterceptor() as any;
    const logger = mkLogger();
    Object.assign(i, {
      logger,
      config: { get: (k: string, d?: string) => env[k] ?? d },
      request: { header: jest.fn(() => header) },
    });
    return { i, logger };
  };

  it('forwards the auth header', () => {
    const { i } = make('Bearer t');
    expect(i.intercept({}).headers).toEqual({ Authorization: 'Bearer t' });
  });

  it('forwards to a custom upstream header', () => {
    const { i } = make('t', { JWT_AUTH_HEADER: 'X-In', UPSTREAM_JWT_AUTH_HEADER: 'X-Out' });
    expect(i.intercept({ headers: {} }).headers).toEqual({ 'X-Out': 't' });
    expect(i.request.header).toHaveBeenCalledWith('X-In');
  });

  it('warns when no header is present', () => {
    const { i, logger } = make(undefined);
    const c = i.intercept({ method: 'get', url: 'u' });
    expect(c.headers).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('[GET] u'), 'DefaultUpstreamInterceptor');
  });
});

describe('options.dto', () => {
  it('builds array schemas', () => {
    expect(OptionsDtoSchema).toMatchObject({ type: 'array', items: { required: ['value', 'display'] } });
    expect(OptionsDtoSchemaFactory({ type: 'number' }).items).toMatchObject({ properties: { value: { type: 'number' } } });
  });
});

describe('GetOpenapiJson', () => {
  const logger = { error: jest.fn() };
  beforeEach(() => {
    logger.error.mockClear();
    (fs.existsSync as jest.Mock).mockReset();
    (fs.readFileSync as jest.Mock).mockReset();
  });

  it('parses the file', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('{"openapi":"3"}'));
    expect(GetOpenapiJson('/app', logger)).toEqual({ openapi: '3' });
  });

  it('throws for missing and invalid files', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    expect(() => GetOpenapiJson('/app', logger)).toThrow('openapi.json not found');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('{'));
    expect(() => GetOpenapiJson('/app', logger)).toThrow('parse error');
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});

describe('OpenApiModule', () => {
  it('factories', () => {
    expect(OpenApiServerConfigFactory({})).toEqual([]);
    expect(OpenApiServerConfigFactory({ serverConfig: [{ id: 'a', url: 'u' }] })).toEqual([{ id: 'a', url: 'u' }]);
    expect(OpenApiUpstreamInterceptorFactory({})).toEqual([]);
    const def = new DefaultUpstreamInterceptor();
    const custom: any = { intercept: jest.fn() };
    const configured: any = { intercept: jest.fn() };
    expect(OpenApiUpstreamInterceptorFactory({ interceptors: [configured] }, def, custom)).toEqual([configured, def, custom]);
  });

  it('does not add the default interceptor twice', () => {
    const def = new DefaultUpstreamInterceptor();
    const other = new DefaultUpstreamInterceptor();
    expect(OpenApiUpstreamInterceptorFactory({}, def, other)).toEqual([other]);
  });

  it('register adds config and interceptor providers', () => {
    class Custom { intercept(c: any) { return c; } }
    const m = OpenApiModule.register({}, [Custom as any]);
    const tokens = m.providers!.map((p: any) => p.provide);
    expect(tokens).toContain(OPEN_API_SERVER_CONFIG);
    expect(tokens.filter((t) => t === OPEN_API_UPSTREAM_INTERCEPTOR)).toHaveLength(2);
    expect(m.providers).toContain(Custom);
    const a = OpenApiModule.registerAsync({ useFactory: () => ({}) });
    expect(a.providers!.map((p: any) => p.provide)).toContain(OPEN_API_SERVER_CONFIG);
  });
});
