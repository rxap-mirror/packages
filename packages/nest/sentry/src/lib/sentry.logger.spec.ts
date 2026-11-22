import * as Sentry from '@sentry/node';
import { SentryLogger } from './sentry.logger';

jest.mock('@sentry/node', () => ({
  addBreadcrumb: jest.fn(),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  },
}));

describe('SentryLogger', () => {

  const sentry = Sentry as any;
  let logger: SentryLogger;
  let sentryOptions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    sentryOptions = { enabled: true, logLevels: undefined };
    logger = new SentryLogger({} as any);
    Object.assign(logger, {
      options: { logLevels: [ 'log', 'error', 'warn', 'debug', 'verbose', 'fatal' ] },
      sentryOptions,
      config: {},
    });
    logger.setContext('Ctx');
    for (const method of [ 'log', 'warn', 'debug', 'verbose', 'error' ] as const) {
      jest.spyOn(Object.getPrototypeOf(SentryLogger.prototype), method).mockImplementation();
    }
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe.each([
    [ 'log', 'info' ],
    [ 'warn', 'warn' ],
    [ 'debug', 'debug' ],
    [ 'verbose', 'trace' ],
  ] as const)('%s', (method, sentryMethod) => {

    it('should send the message to sentry logger', () => {
      logger[method]('message');
      expect(sentry.logger[sentryMethod]).toHaveBeenCalledWith('message', { data: expect.anything() });
    });

    it('should use the explicit context', () => {
      logger[method]('message', 'Other');
      expect(sentry.logger[sentryMethod]).toHaveBeenCalledWith('message', { data: method === 'log' ? 'Other' : { context: 'Other' } });
    });

    it('should not send when disabled', () => {
      sentryOptions.enabled = false;
      logger[method]('message');
      expect(sentry.logger[sentryMethod]).not.toHaveBeenCalled();
    });

    it('should not send when the level is filtered', () => {
      sentryOptions.logLevels = [ 'fatal' ];
      logger[method]('message');
      expect(sentry.logger[sentryMethod]).not.toHaveBeenCalled();
    });

    it('should survive sentry failures', () => {
      sentry.logger[sentryMethod].mockImplementationOnce(() => {
        throw new Error('fail');
      });
      expect(() => logger[method]('message')).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Failed to capture message with sentry: fail');
    });

  });

  describe.each([ 'log', 'warn', 'debug' ] as const)('%s as breadcrumb', (method) => {
    it('should add a breadcrumb when the last param is true', () => {
      logger[method]('message', 'Ctx', true);
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({ message: 'message' }));
    });

    it('should survive breadcrumb failures', () => {
      sentry.addBreadcrumb.mockImplementationOnce(() => {
        throw new Error('fail');
      });
      logger[method]('message', true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe.each([ 'error', 'fatal' ] as const)('%s', (method) => {

    it('should send message with context and stack', () => {
      logger[method]('message', 'the-stack', 'Other');
      expect(sentry.logger[method]).toHaveBeenCalledWith('message', { data: { context: 'Other', stack: 'the-stack' } });
    });

    it('should send message without stack', () => {
      logger[method]('message');
      expect(sentry.logger[method]).toHaveBeenCalledWith('message', { data: expect.objectContaining({ stack: undefined }) });
    });

    it('should keep non string last params', () => {
      logger[method]('message', { a: 1 });
      expect(sentry.logger[method]).toHaveBeenCalledWith('message', { data: expect.objectContaining({ stack: undefined }) });
    });

    it('should not send when disabled or filtered', () => {
      sentryOptions.logLevels = [ 'trace' ];
      logger[method]('message');
      sentryOptions.enabled = false;
      logger[method]('message');
      expect(sentry.logger[method]).not.toHaveBeenCalled();
    });

    it('should survive sentry failures', () => {
      sentry.logger[method].mockImplementationOnce(() => {
        throw new Error('fail');
      });
      expect(() => logger[method]('message')).not.toThrow();
    });

  });

});
