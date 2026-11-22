import { ValidationPipe } from '@nestjs/common';
import * as Joi from 'joi';
import { corsValidationSchema, SetupCors } from './setup-cors';
import { SetupSwagger } from './setup-swagger';
import { SetupHelmet } from './setup-helmet';
import { SetupCookieParser } from './setup-cookie-parser';
import { ValidationPipeSetup } from './validation-pipe-setup';
import { serverValidationSchema } from './server-validation-schema';

const swaggerCreate = jest.fn().mockReturnValue('doc');
const swaggerSetup = jest.fn();
jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  return { ...actual, SwaggerModule: { createDocument: (...a: any[]) => swaggerCreate(...a), setup: (...a: any[]) => swaggerSetup(...a) } };
});
const helmetFn = jest.fn().mockReturnValue('helmet-mw');
jest.mock('helmet', () => ({ __esModule: true, default: (...a: any[]) => helmetFn(...a) }));
const cookieFn = jest.fn().mockReturnValue('cookie-mw');
jest.mock('cookie-parser', () => ({ __esModule: true, default: (...a: any[]) => cookieFn(...a) }));

describe('SetupCors', () => {
  const values: Record<string, any> = {
    CORS_ORIGIN: 'https://a.com, /^https:\\/\\/.*\\.b\\.com$/',
    CORS_CREDENTIALS: true,
    CORS_ALLOWED_HEADERS: 'x,y',
    CORS_EXPOSED_HEADERS: 'e',
    CORS_METHODS: 'GET,POST',
  };
  const config = (v = values) => ({ getOrThrow: jest.fn((k: string) => v[k]) }) as any;

  it('parses origins, headers and methods', () => {
    const app = { enableCors: jest.fn() };
    const logger = { debug: jest.fn(), log: jest.fn() };
    SetupCors()(app as any, config(), logger as any);
    const opts = app.enableCors.mock.calls[0][0];
    expect(opts.origin[0]).toBe('https://a.com');
    expect(opts.origin[1]).toBeInstanceOf(RegExp);
    expect(opts.allowedHeaders).toEqual(['x', 'y']);
    expect(opts.methods).toEqual(['GET', 'POST']);
    expect(opts.exposedHeaders).toEqual(['e']);
    expect(logger.debug).toHaveBeenCalled();
  });

  it('keeps boolean origin, merges overrides, falls back to log', () => {
    const app = { enableCors: jest.fn() };
    const logger = { log: jest.fn() };
    SetupCors({ corsOptions: { maxAge: 5 } })(app as any, config({ ...values, CORS_ORIGIN: true }), logger as any);
    expect(app.enableCors.mock.calls[0][0]).toMatchObject({ origin: true, maxAge: 5 });
    expect(logger.log).toHaveBeenCalled();
  });

  it('corsValidationSchema provides defaults', () => {
    const { value } = Joi.object(corsValidationSchema({} as any)).validate({});
    expect(value).toEqual({
      CORS_ORIGIN: true,
      CORS_CREDENTIALS: true,
      CORS_ALLOWED_HEADERS: 'sentry-trace,baggage,content-type',
      CORS_EXPOSED_HEADERS: '',
      CORS_METHODS: 'GET,PUT,POST,DELETE',
    });
    const custom = Joi.object(corsValidationSchema({} as any, { origin: 'x', methods: ['GET'] })).validate({}).value;
    expect(custom).toMatchObject({ CORS_ORIGIN: 'x', CORS_METHODS: 'GET' });
  });
});

describe('SetupSwagger', () => {
  it('creates the document and mounts it', () => {
    const app = {} as any;
    SetupSwagger({ path: 'docs' })(app, {}, {}, { version: '1', publicUrl: 'http://p' });
    const docConfig = swaggerCreate.mock.calls[0][1];
    expect(docConfig.info.version).toBe('1');
    expect(docConfig.servers).toEqual([{ url: 'http://p', description: undefined, variables: undefined }].map((s) => expect.objectContaining({ url: s.url })));
    expect(swaggerSetup).toHaveBeenCalledWith('docs', app, 'doc', undefined);
  });

  it('applies the builder and default path', () => {
    const builder = jest.fn((b) => b.setTitle('T'));
    SetupSwagger({ builder })({} as any, {}, {}, { version: '1', publicUrl: 'p' });
    expect(swaggerCreate.mock.calls.at(-1)![1].info.title).toBe('T');
    expect(swaggerSetup.mock.calls.at(-1)![0]).toBe('openapi');
  });
});

describe('SetupHelmet / SetupCookieParser', () => {
  it('uses helmet', () => {
    const app = { use: jest.fn() };
    SetupHelmet({ helmetOptions: { hsts: false } })(app as any);
    expect(helmetFn).toHaveBeenCalledWith({ hsts: false });
    expect(app.use).toHaveBeenCalledWith('helmet-mw');
  });
  it('uses cookie-parser with the configured secret', () => {
    const app = { use: jest.fn() };
    SetupCookieParser({ cookieParserOptions: { decode: String } })(app as any, { get: () => 'sec' } as any);
    expect(cookieFn).toHaveBeenCalledWith('sec', { decode: String });
    expect(app.use).toHaveBeenCalledWith('cookie-mw');
  });
});

describe('ValidationPipeSetup', () => {
  it('registers a configured global ValidationPipe', async () => {
    const app = { useGlobalPipes: jest.fn() };
    ValidationPipeSetup({ validatorPipeOptions: { whitelist: false } })(app as any, {}, {}, {}, { production: false } as any);
    const pipe = app.useGlobalPipes.mock.calls[0][0];
    expect(pipe).toBeInstanceOf(ValidationPipe);
    expect((pipe as any).isTransformEnabled).toBe(true);
    expect((pipe as any).validatorOptions.whitelist).toBe(false);
    expect((pipe as any).isDetailedOutputDisabled).toBeFalsy();
  });
  it('disables debug messages in production', () => {
    const app = { useGlobalPipes: jest.fn() };
    ValidationPipeSetup()(app as any, {}, {}, {}, { production: true } as any);
    expect((app.useGlobalPipes.mock.calls[0][0] as any).enableDebugMessages).toBeUndefined;
  });
});

describe('serverValidationSchema', () => {
  const validate = (env: any, opts?: any, input: any = {}) =>
    Joi.object(serverValidationSchema(env, opts)).validate(input);

  it('applies development defaults', () => {
    const { value, error } = validate({ production: false });
    expect(error).toBeUndefined();
    expect(value).toMatchObject({
      PORT: 3000,
      GLOBAL_API_PREFIX: 'api',
      ENVIRONMENT: 'development',
      LOG_LEVEL: 'verbose',
      API_PROTOCOL: 'http',
    });
    expect(value.API_PORT).toBeUndefined();
  });

  it('applies production defaults', () => {
    const { value } = validate({ production: true, tier: 'live' });
    expect(value).toMatchObject({ API_PORT: 443, API_PROTOCOL: 'https', ENVIRONMENT: 'live', LOG_LEVEL: 'log' });
  });

  it('applies explicit options and validates input', () => {
    const { value } = validate({ production: false }, { port: 1, apiUrl: 'http://a.b', apiBaseUrl: 'http://a.b/c', apiDomain: 'foo' });
    expect(value).toMatchObject({ PORT: 1, API_URL: 'http://a.b', API_BASE_URL: 'http://a.b/c', API_DOMAIN: 'foo' });
    expect(validate({ production: false }, {}, { LOG_LEVEL: 'nope' }).error).toBeDefined();
    expect(validate({ production: false }, {}, { PORT: 70000 }).error).toBeDefined();
  });
});
