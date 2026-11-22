import { ConfigService } from '@nestjs/config';
import { RxapLogger } from '@rxap/nest-logger';
import { SentryLoggerModule } from './sentry-logger.module';
import { SentryModuleOptionsFactory } from './sentry-module-options.factory';
import { SentryLogger } from './sentry.logger';
import {
  SENTRY_MODULE_OPTIONS,
} from './tokens';
import { UseSentryLoggerFactory } from './use-sentry-logger-factory';

describe('SentryModuleOptionsFactory', () => {
  it('should create options from the config', async () => {
    jest.spyOn(console, 'debug').mockImplementation();
    const factory = new SentryModuleOptionsFactory();
    const config = { getOrThrow: jest.fn((key: string) => key === 'SENTRY_LOG_LEVEL' ? 'error' : true) };
    (factory as any).config = config;
    const options = await factory.create();
    expect(options.logLevels).toEqual([ 'error', 'fatal' ]);
    expect(options.enabled).toBe(true);
    expect(options.logger?.timestamp).toBe(true);
    jest.restoreAllMocks();
  });
});

describe('UseSentryLoggerFactory', () => {
  const sentry = { name: 'sentry' };
  const rxap = { name: 'rxap' };
  const app: any = { get: jest.fn((token: any) => token === SentryLogger ? sentry : rxap) };

  it('should use the sentry logger if enabled', () => {
    expect(UseSentryLoggerFactory()(app, { get: () => true } as unknown as ConfigService)).toBe(sentry);
  });

  it('should use the rxap logger otherwise', () => {
    expect(UseSentryLoggerFactory()(app, { get: () => false } as unknown as ConfigService)).toBe(rxap);
    expect(app.get).toHaveBeenCalledWith(RxapLogger);
  });
});

describe('SentryLoggerModule', () => {

  it('should register with options', () => {
    const module = SentryLoggerModule.register({ logLevels: [ 'error' ], logger: { prefix: 'x' } }, { timestamp: false });
    const providers: any[] = module.providers!;
    const tokenProvider = providers.find(p => p.provide === SENTRY_MODULE_OPTIONS);
    expect(tokenProvider.useExisting).toBeDefined();
    const loggerOptions = providers.find(p => p.useFactory && p.inject?.[0] === SENTRY_MODULE_OPTIONS);
    expect(loggerOptions.useFactory({ logger: { prefix: 'x' } })).toEqual(expect.objectContaining({ prefix: 'x', timestamp: false }));
    expect(loggerOptions.useFactory({})).toEqual(expect.objectContaining({ timestamp: false }));
  });

  it('should register logger functions and async', () => {
    const print = jest.fn();
    const format = jest.fn();
    const module = SentryLoggerModule.registerAsync({ useFactory: () => ({ logLevels: [] }) }, null, {
      printMessagesFunction: print,
      formatMessageFunction: format,
    });
    const values = (module.providers as any[]).map(p => p.useValue).filter(Boolean);
    expect(values).toEqual([ print, format ]);
  });

  it('should provide the logger selecting factory', () => {
    const metadata = Reflect.getMetadata('providers', SentryLoggerModule) as any[];
    const loggerProvider = metadata.find(p => p.useFactory);
    const sentry = {};
    const rxap = {};
    expect(loggerProvider.useFactory({ get: () => true }, sentry, rxap)).toBe(sentry);
    expect(loggerProvider.useFactory({ get: () => false }, sentry, rxap)).toBe(rxap);
  });

});
