import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { of, throwError, lastValueFrom } from 'rxjs';
import { AcceptLanguage, AcceptLanguages } from './accept-language.decorator';
import { ApplyFilter } from './apply-filter';
import { ApplySort } from './apply-sort';
import { CacheModuleOptionsLoader } from './cache-module-options-loader';
import {
  ClassTransformOptionsFactory,
  classTransformOptions,
} from './class-transformer-options';
import { ValidatorOptionsFactory, validatorOptions } from './class-validator-options';
import { defaultSetHeaders } from './content-security-policy';
import { DetermineEnvironment } from './determine-environment';
import { DetermineProductionEnvironmentName } from './determine-production-environment-name';
import { DetermineRelease } from './determine-release';
import { DetermineReleaseName } from './determine-release-name';
import { DetermineVersion } from './determine-version';
import { EnvironmentFactory, EnvironmentModule } from './environment.module';
import { FilterQueryPipe } from './filter-query.pipe';
import { GetLogLevels } from './get-log-levels';
import { HealthCheckStatusSchema } from './health-check-status-schema';
import { Host } from './host.decorator';
import { HttpExceptionFilter } from './http-exception-filter';
import { IS_INTERNAL_KEY, Internal } from './is-internal';
import { IS_PUBLIC_KEY, Public } from './is-public';
import { IsDevMode, RXAP_GLOBAL_STATE } from './is-dev-mode';
import { LoggingInterceptor } from './logging.interceptor';
import { mimeTypeToFileExtension } from './mimeType-to-file-extanson';
import { DecodeURIComponentPipe } from './pipe/decodeURIComponent.pipe';
import { ThrottlerModuleOptionsLoader } from './throttler-module-options-loader';
import { ENVIRONMENT } from './tokens';
import {
  ValidationErrorListToString,
  ValidationException,
  ValidationHttpException,
} from './validation-exception';
import { ValidatorInterceptor } from './validator.interceptor';

function paramFactory(decorator: () => ParameterDecorator) {
  class Test {
    handler(@decorator() _v: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'handler');
  return Object.values<any>(args)[0].factory as (data: unknown, ctx: any) => unknown;
}
const httpCtx = (request: any) => ({ switchToHttp: () => ({ getRequest: () => request }) }) as any;

describe('ApplyFilter', () => {
  const rows = [
    { name: 'Alice', city: 'Berlin' },
    { name: 'Bob', city: 'Bonn' },
    { name: 'Carl', city: null },
  ];

  it('returns the rows unchanged without filter', () => {
    expect(ApplyFilter(rows)).toBe(rows);
    expect(ApplyFilter(rows, [])).toBe(rows);
  });

  it('filters case-insensitively and keeps rows without a value', () => {
    expect(ApplyFilter(rows, [{ column: 'name', filter: 'AL' }])).toEqual([rows[0]]);
    expect(ApplyFilter(rows, [{ column: 'city', filter: 'b' }])).toEqual(rows);
    expect(ApplyFilter(rows, [{ column: 'city', filter: 'bo' }, { column: 'name', filter: 'b' }])).toEqual([rows[1]]);
  });

  it('keeps non-object rows', () => {
    expect(ApplyFilter<any>([1, 'x'], [{ column: 'a', filter: 'b' }])).toEqual([1, 'x']);
  });
});

describe('ApplySort', () => {
  const make = () => [{ n: 'b' }, { n: 'a' }, { n: 'c' }];

  it('does not sort without sortBy', () => {
    expect(ApplySort(make())).toEqual(make());
  });

  it('sorts ascending by default and descending on request', () => {
    expect(ApplySort(make(), undefined, 'n').map((r) => r.n)).toEqual(['a', 'b', 'c']);
    expect(ApplySort(make(), 'desc', 'n').map((r) => r.n)).toEqual(['c', 'b', 'a']);
  });

  it('puts undefined values last when ascending and first when descending', () => {
    const rows = () => [{ n: undefined }, { n: 'a' }, { n: undefined }, { n: 'b' }] as any[];
    expect(ApplySort(rows(), 'asc', 'n').map((r) => r.n)).toEqual(['a', 'b', undefined, undefined]);
    expect(ApplySort(rows(), 'desc', 'n').map((r) => r.n)).toEqual([undefined, undefined, 'b', 'a']);
  });

  it('keeps the order of non-objects', () => {
    expect(ApplySort<any>([2, 1], 'asc', 'n')).toEqual([2, 1]);
  });
});

describe('FilterQueryPipe', () => {
  const pipe = new FilterQueryPipe();
  it('returns an empty list for empty values', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });
  it('parses strings using the delimiter', () => {
    expect(pipe.transform('a|b')).toEqual([{ column: 'a', filter: 'b' }]);
    expect(pipe.transform(['a|b', 'c|d'])).toEqual([{ column: 'a', filter: 'b' }, { column: 'c', filter: 'd' }]);
    expect(new FilterQueryPipe(':').transform('a:b')).toEqual([{ column: 'a', filter: 'b' }]);
  });
  it('passes objects through', () => {
    const q = { column: 'a', filter: 'b' };
    expect(pipe.transform(q)).toEqual([q]);
  });
});

describe('determine helpers', () => {
  const env = (e: any) => ({ app: 'x', production: true, ...e });

  it('DetermineProductionEnvironmentName', () => {
    expect(DetermineProductionEnvironmentName(env({ tier: 'staging' }))).toBe('staging');
    expect(DetermineProductionEnvironmentName(env({ tag: 'v1.2.3' }))).toBe('production');
    expect(DetermineProductionEnvironmentName(env({ tag: 'v1.2.3-beta.1' }))).toBe('beta');
    expect(DetermineProductionEnvironmentName(env({ tag: 'garbage' }))).toBeUndefined();
    expect(DetermineProductionEnvironmentName(env({ branch: 'dev' }))).toBe('dev');
    expect(DetermineProductionEnvironmentName(env({}))).toBeUndefined();
  });

  it('DetermineEnvironment', () => {
    expect(DetermineEnvironment(env({ tier: 'local' }))).toBeUndefined();
    expect(DetermineEnvironment(env({ tier: 'production' }))).toBe('production');
    expect(DetermineEnvironment(env({ tier: 'other' }))).toBeUndefined();
  });

  it('DetermineRelease', () => {
    expect(DetermineRelease(env({ tier: 'local', tag: 'v1' }))).toBeUndefined();
    expect(DetermineRelease(env({ tier: 'production', tag: 'v1' }))).toBe('v1');
    expect(DetermineRelease(env({ tier: 'production' }))).toBeUndefined();
    expect(DetermineRelease(env({ tier: 'x', tag: 'v1' }))).toBeUndefined();
  });

  it.each([DetermineReleaseName, DetermineVersion])('%p falls back tag, branch, local-development', (fn) => {
    expect(fn(env({ tag: 't', branch: 'b' }))).toBe('t');
    expect(fn(env({ branch: 'b' }))).toBe('b');
    expect(fn(env({}))).toBe('local-development');
  });
});

describe('IsDevMode', () => {
  afterEach(() => (RXAP_GLOBAL_STATE.environment = null));
  it('reflects the global environment', () => {
    expect(IsDevMode()).toBeNull();
    RXAP_GLOBAL_STATE.environment = { app: 'x', production: false };
    expect(IsDevMode()).toBe(true);
    RXAP_GLOBAL_STATE.environment = { app: 'x', production: true };
    expect(IsDevMode()).toBe(false);
  });
});

describe('GetLogLevels', () => {
  const original = process.env['LOG_LEVEL'];
  beforeEach(() => jest.spyOn(console, 'debug').mockImplementation(() => undefined));
  afterEach(() => {
    jest.restoreAllMocks();
    if (original === undefined) delete process.env['LOG_LEVEL'];
    else process.env['LOG_LEVEL'] = original;
  });

  it.each([
    ['verbose', ['verbose', 'debug', 'log', 'warn', 'error', 'fatal']],
    ['DEBUG', ['debug', 'log', 'warn', 'error', 'fatal']],
    ['log', ['log', 'warn', 'error', 'fatal']],
    ['warn', ['warn', 'error', 'fatal']],
    ['error', ['error', 'fatal']],
    ['fatal', ['fatal']],
    ['unknown', ['warn', 'error', 'fatal']],
  ])('LOG_LEVEL=%s', (level, expected) => {
    process.env['LOG_LEVEL'] = level;
    expect(GetLogLevels()).toEqual(expected);
  });

  it('defaults to warn', () => {
    delete process.env['LOG_LEVEL'];
    expect(GetLogLevels()).toEqual(['warn', 'error', 'fatal']);
  });
});

describe('mimeTypeToFileExtension', () => {
  it('maps known types', () => {
    expect(mimeTypeToFileExtension('image/png')).toBe('.png');
    expect(mimeTypeToFileExtension('application/json')).toBe('.json');
  });
  it('falls back to the default or empty string', () => {
    expect(mimeTypeToFileExtension('foo/bar')).toBe('');
    expect(mimeTypeToFileExtension('foo/bar', '.bin')).toBe('.bin');
    expect(mimeTypeToFileExtension(undefined, '.bin')).toBe('.bin');
    expect(mimeTypeToFileExtension(undefined as any)).toBe('');
  });
});

describe('options', () => {
  it('ClassTransformOptionsFactory merges options', () => {
    expect(ClassTransformOptionsFactory()).toEqual(classTransformOptions);
    expect(ClassTransformOptionsFactory({ groups: ['a'] })).toEqual({ ...classTransformOptions, groups: ['a'] });
  });
  it('ValidatorOptionsFactory merges options', () => {
    expect(ValidatorOptionsFactory({ whitelist: true })).toEqual({ ...validatorOptions, whitelist: true });
    expect(ValidatorOptionsFactory()).toEqual(validatorOptions);
  });
  it('CacheModuleOptionsLoader reads config and falls back for NaN', () => {
    const loader: any = new CacheModuleOptionsLoader();
    loader.config = { get: (k: string, d: any) => ({ CACHE_TTL: '5', CACHE_MAX: 'x' })[k] ?? d };
    expect(loader.createCacheOptions()).toEqual({ isGlobal: true, ttl: 5, max: 100 });
    loader.config = { get: (_k: string, d: any) => d };
    expect(loader.createCacheOptions()).toEqual({ isGlobal: true, ttl: 3600000, max: 100 });
  });
  it('ThrottlerModuleOptionsLoader requires config values', () => {
    const loader: any = new ThrottlerModuleOptionsLoader();
    loader.config = { getOrThrow: (k: string) => (k === 'THROTTLER_TTL' ? 1 : 2) };
    expect(loader.createThrottlerOptions()).toEqual({ throttlers: [{ ttl: 1, limit: 2 }] });
  });
});

describe('metadata decorators', () => {
  it('Public and Internal set metadata', () => {
    class A {
      @Public() a() {}
      @Internal() b() {}
    }
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, A.prototype.a)).toBe(true);
    expect(Reflect.getMetadata(IS_INTERNAL_KEY, A.prototype.b)).toBe(true);
  });
});

describe('param decorators', () => {
  it('Host returns request.host', () => {
    expect(paramFactory(Host as any)(undefined, httpCtx({ host: 'h' }))).toBe('h');
  });
  it('AcceptLanguage(s)', () => {
    const request = { acceptsLanguages: () => ['de', 'en'] };
    expect(paramFactory(AcceptLanguage as any)(undefined, httpCtx(request))).toBe('de');
    expect(paramFactory(AcceptLanguages as any)(undefined, httpCtx(request))).toEqual(['de', 'en']);
  });
});

describe('DecodeURIComponentPipe', () => {
  it('decodes values', () => {
    expect(new DecodeURIComponentPipe().transform('a%20b', {} as any)).toBe('a b');
  });
});

describe('health check schema', () => {
  it('requires status and details', () => {
    expect(HealthCheckStatusSchema.required).toEqual(['status', 'details']);
  });
});

describe('defaultSetHeaders', () => {
  const res = () => ({ setHeader: jest.fn() });
  it('always sets the document policy', () => {
    const r = res();
    defaultSetHeaders()(r as any);
    expect(r.setHeader.mock.calls).toEqual([['Document-Policy', 'js-profiling']]);
  });
  it('sets CSP and reporting headers', () => {
    const r = res();
    defaultSetHeaders({ contentSecurityPolicy: 'default-src x', reportUri: 'https://r.example.com/x' })(r as any);
    const headers = Object.fromEntries(r.setHeader.mock.calls);
    expect(headers['Content-Security-Policy']).toBe('default-src x');
    expect(headers['Reporting-Endpoints']).toBe('csp-endpoint="https://r.example.com/x"');
    expect(JSON.parse(headers['Report-To']).endpoints[0].url).toBe('https://r.example.com/x');
  });
});

describe('EnvironmentModule', () => {
  it('EnvironmentFactory returns the options', () => {
    const e = { app: 'x', production: true };
    expect(EnvironmentFactory(e)).toBe(e);
  });
  it('register and registerAsync add the ENVIRONMENT provider', () => {
    const sync = EnvironmentModule.register({ app: 'x', production: true });
    expect(sync.exports).toContain(ENVIRONMENT);
    expect((sync.providers as any[]).some((p) => p.provide === ENVIRONMENT)).toBe(true);
    const async = EnvironmentModule.registerAsync({ useFactory: () => ({ app: 'x', production: true }) });
    expect(async.exports).toContain(ENVIRONMENT);
  });
});

describe('validation exceptions', () => {
  class Target {}
  const errors: any[] = [
    { target: new Target(), property: 'a', constraints: { isString: 'x', isNotEmpty: 'y' } },
    { property: 'b' },
  ];

  it('formats the error list grouped by target', () => {
    const msg = ValidationErrorListToString(errors);
    expect(msg).toContain("An instance of 'Target' has failed the validation");
    expect(msg).toContain("property 'a' has failed the following constraints: isString, isNotEmpty");
    expect(msg).toContain("An instance of 'Unknown'");
  });

  it('ValidationException carries the list', () => {
    const e = new ValidationException(errors);
    expect(e.validationErrorList).toBe(errors);
    expect(e.message).toContain('Validation Errors');
  });

  it('ValidationHttpException defaults to 500', () => {
    const e = new ValidationHttpException(errors);
    expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect((e.getResponse() as any).errors).toBe(errors);
    expect(new ValidationHttpException(errors, HttpStatus.BAD_REQUEST).getStatus()).toBe(400);
  });
});

describe('interceptors', () => {
  const logger = () => ({ debug: jest.fn(), verbose: jest.fn(), error: jest.fn() });
  const context = (name: string, request: any = { method: 'get', url: '/x' }) =>
    ({ getClass: () => ({ name }), switchToHttp: () => ({ getRequest: () => request }) }) as any;

  describe('LoggingInterceptor', () => {
    const make = () => {
      const i: any = new LoggingInterceptor();
      i.logger = logger();
      return i;
    };

    it('skips health and app controllers', async () => {
      const i = make();
      const next = { handle: jest.fn(() => of(1)) };
      await lastValueFrom(i.intercept(context('HealthController'), next));
      await lastValueFrom(i.intercept(context('AppController'), next));
      expect(i.logger.debug).not.toHaveBeenCalled();
    });

    it('logs success with and without body', async () => {
      const i = make();
      await lastValueFrom(i.intercept(context('C'), { handle: () => of({ a: 1 }) }));
      expect(i.logger.debug).toHaveBeenCalledWith('GET /x', 'C');
      expect(i.logger.debug.mock.calls[1][0]).toMatch(/^SUCCESS GET \/x \+\d+ms$/);
      expect(i.logger.verbose).toHaveBeenCalledWith('RESPONSE {"a":1}', 'C');
      await lastValueFrom(i.intercept(context('C'), { handle: () => of(null) }));
      expect(i.logger.verbose).toHaveBeenCalledWith('RESPONSE <empty>', 'C');
    });

    it('logs failures and rethrows', async () => {
      const i = make();
      await expect(
        lastValueFrom(i.intercept(context('C'), { handle: () => throwError(() => new Error('bad')) })),
      ).rejects.toThrow('bad');
      expect(i.logger.debug.mock.calls[1][0]).toMatch(/^FAILURE bad \/x/);
    });
  });

  describe('ValidatorInterceptor', () => {
    const { IsString } = require('class-validator');
    class Dto {
      @IsString() name!: any;
    }
    const make = () => {
      const i: any = new ValidatorInterceptor();
      i.logger = logger();
      return i;
    };

    it('skips health and app controllers', async () => {
      const i = make();
      const bad = new Dto();
      expect(await lastValueFrom(i.intercept(context('AppController'), { handle: () => of(bad) }))).toBe(bad);
    });

    it('passes valid and empty bodies', async () => {
      const i = make();
      const ok = Object.assign(new Dto(), { name: 'x' });
      expect(await lastValueFrom(i.intercept(context('C'), { handle: () => of(ok) }))).toBe(ok);
      expect(await lastValueFrom(i.intercept(context('C'), { handle: () => of(undefined) }))).toBeUndefined();
    });

    it('throws a ValidationHttpException for invalid bodies', async () => {
      const i = make();
      await expect(
        lastValueFrom(i.intercept(context('C'), { handle: () => of(new Dto()) })),
      ).rejects.toBeInstanceOf(ValidationHttpException);
      expect(i.logger.error).toHaveBeenCalled();
      expect(i.logger.verbose).toHaveBeenCalled();
    });
  });
});

describe('HttpExceptionFilter', () => {
  it('logs and delegates to the base filter', () => {
    const filter: any = new HttpExceptionFilter();
    filter.logger = { debug: jest.fn() };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host: any = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'get', path: '/p' }), getResponse: () => response }),
      getType: () => 'http',
    };
    const base = jest.spyOn(Object.getPrototypeOf(HttpExceptionFilter.prototype), 'catch').mockImplementation(() => undefined);
    const ex = new BadRequestException('nope');
    filter.catch(ex, host);
    expect(filter.logger.debug).toHaveBeenCalledWith('nope', '(400) GET /p');
    expect(base).toHaveBeenCalledWith(ex, host);
    base.mockRestore();
  });
});
