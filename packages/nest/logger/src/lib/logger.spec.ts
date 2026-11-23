import { Test } from '@nestjs/testing';
import {
  CONSOLE_LOGGER_OPTIONS,
  RXAP_LOGGER_FORMAT_MESSAGE,
  RXAP_LOGGER_PRINT_MESSAGES,
  RxapLogger,
} from '@rxap/nest-logger';

describe('RxapLogger', () => {

  let logger: RxapLogger;

  beforeEach(() => {
    logger = new RxapLogger();
  });

  it.each([ 'log', 'verbose', 'debug', 'warn' ])(
    'should interpolate %JSON with the corresponding optionalParam for the method %s', (method) => {
      const spy = jest.spyOn(process.stdout, 'write');
      (
        logger as any
      )[method]('test %JSON', { test: 'test' });
      expect(spy.mock.lastCall?.[0]).toContain(`test {"test":"test"}`);
      expect(spy.mock.lastCall?.[0]).toContain(method.toUpperCase());
      (
        logger as any
      )[method]('test %JSON', { test: 'test' }, 'custom-context');
      expect(spy.mock.lastCall?.[0]).toContain(`test {"test":"test"}`);
      expect(spy.mock.lastCall?.[0]).toContain(method.toUpperCase());
      expect(spy.mock.lastCall?.[0]).toContain(`[custom-context]`);
    });

  it.each([true, false])('should interpolate %JSON with boolean value %b', (bool) => {

    const spy = jest.spyOn(process.stdout, 'write');
    logger.log('test %JSON', bool);
    expect(spy.mock.lastCall?.[0]).toContain(`test ${JSON.stringify(bool)}`);

  });

  it.each([-1, 0, 1])('should interpolate %JSON with number value: %i', (num) => {

    const spy = jest.spyOn(process.stdout, 'write');
    logger.log('test %JSON', num);
    expect(spy.mock.lastCall?.[0]).toContain(`test ${JSON.stringify(num)}`);

  });

  it.each(['text', ''])('should interpolate %JSON with string value: %s', (str) => {

    const spy = jest.spyOn(process.stdout, 'write');
    logger.log('test %JSON', str, 'context');
    expect(spy.mock.lastCall?.[0]).toContain(`test ${JSON.stringify(str)}`);

  });

  it('should interpolate %JSON with null value', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    logger.log('test %JSON', null);
    expect(spy.mock.lastCall?.[0]).toContain(`test <null>`);
  });

  it('should interpolate %JSON with undefined value', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    logger.log('test %JSON', undefined);
    expect(spy.mock.lastCall?.[0]).toContain(`test <undefined>`);
  });

  describe('interpolation edge cases', () => {

    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      spy.mockRestore();
    });

    // Nest prints every message of a log call in a separate write
    // eslint-disable-next-line no-control-regex
    const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, '');
    const allOutput = () => stripAnsi(spy.mock.calls.map((call) => String(call[0])).join(''));

    it('should print a message without parameters unchanged', () => {
      logger.log('plain %JSON');
      expect(spy.mock.lastCall?.[0]).toContain('plain %JSON');
    });

    it('should not interpolate when the first message is not a string', () => {
      logger.log({ a: 1 }, 'ctx');
      const output = allOutput();
      expect(output).toContain('[ctx] Object(1)');
      expect(output).toContain('a: 1');
    });

    it('should not interpolate when the first of several messages is not a string', () => {
      logger.log({ a: 1 }, { b: 2 });
      const output = allOutput();
      expect(output).toContain('a: 1');
      expect(output).toContain('b: 2');
    });

    it('should not interpolate when the first message has no %JSON placeholder', () => {
      logger.log('no placeholder', { a: 1 });
      const output = allOutput();
      expect(output).toContain('no placeholder');
      expect(output).toContain('a: 1');
      expect(output).not.toContain('{"a":1}');
    });

    it('should stringify objects and replace circular references', () => {
      const obj: any = { name: 'x' };
      obj.self = obj;
      logger.log('value %JSON', obj);
      expect(spy.mock.lastCall?.[0]).toContain('value {"name":"x","self":"[Circular]"}');
    });

    it('should interpolate multiple placeholders in order', () => {
      logger.log('%JSON and %JSON', 1, true);
      expect(spy.mock.lastCall?.[0]).toContain('1 and true');
    });

    it('should replace a placeholder without a parameter with <json>', () => {
      logger.log('%JSON and %JSON', 1);
      expect(spy.mock.lastCall?.[0]).toContain('1 and <json>');
    });

    it('should keep a non serializable parameter as additional message and print <json>', () => {
      const fn = jest.fn(() => 'from-function');
      logger.log('value %JSON', fn);
      const output = allOutput();
      expect(output).toContain('value <json>');
      // the function is not consumed by the placeholder and is printed as its own message (Nest calls it)
      expect(fn).toHaveBeenCalledTimes(1);
      expect(output).toContain('from-function');
    });

  });

  describe('default options', () => {

    it('should disable structured params by default', () => {
      const instance = new RxapLogger('ctx') as any;
      expect(instance.options.structuredParams).toBe(false);
    });

    it('should allow to opt in to structured params', () => {
      const instance = new RxapLogger('ctx', { structuredParams: true }) as any;
      expect(instance.options.structuredParams).toBe(true);
    });

  });

  describe('dependency injection', () => {

    let spy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
      errorSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      spy.mockRestore();
      errorSpy.mockRestore();
    });

    async function create(providers: any[] = []): Promise<RxapLogger> {
      const moduleRef = await Test.createTestingModule({
        providers: [ RxapLogger, ...providers ],
      }).compile();
      return moduleRef.get(RxapLogger);
    }

    it('should work without optional providers', async () => {
      const instance = await create();
      instance.log('hello %JSON', 1);
      expect(spy.mock.lastCall?.[0]).toContain('hello 1');
    });

    it('should apply the injected console logger options', async () => {
      const instance = await create([
        { provide: CONSOLE_LOGGER_OPTIONS, useValue: { logLevels: [ 'error' ] } },
      ]);
      instance.log('hidden');
      expect(spy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      instance.error('shown');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.lastCall?.[0]).toContain('shown');
    });

    it('should use the injected format message function', async () => {
      const format = jest.fn(
        (_pid: string, _timestamp: string, level: string, _context: string, output: string) =>
          `custom|${level.trim()}|${output.trim()}\n`,
      );
      const instance = await create([
        { provide: RXAP_LOGGER_FORMAT_MESSAGE, useValue: format },
      ]);
      instance.warn('formatted %JSON', { a: 1 });
      expect(format).toHaveBeenCalledTimes(1);
      expect(format.mock.calls[0][4]).toContain('formatted {"a":1}');
      // eslint-disable-next-line no-control-regex
      const written = String(spy.mock.lastCall?.[0]).replace(/\u001b\[[0-9;]*m/g, '');
      expect(written).toBe('custom|   WARN|formatted {"a":1}\n');
    });

    it('should use the injected print messages function and skip the default output when it returns false', async () => {
      const print = jest.fn(() => false);
      const instance = await create([
        { provide: RXAP_LOGGER_PRINT_MESSAGES, useValue: print },
      ]);
      instance.error('custom printed');
      expect(print).toHaveBeenCalledTimes(1);
      expect(print).toHaveBeenCalledWith([ 'custom printed' ], '', 'error', 'stderr');
      expect(spy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should pass the context to the injected print messages function', async () => {
      const print = jest.fn(() => false);
      const instance = await create([
        { provide: RXAP_LOGGER_PRINT_MESSAGES, useValue: print },
      ]);
      instance.log('with context', 'my-context');
      expect(print).toHaveBeenCalledWith([ 'with context' ], 'my-context', 'log', 'stdout');
    });

    it('should call the default output when the injected print messages function returns true', async () => {
      const print = jest.fn(() => true);
      const instance = await create([
        { provide: RXAP_LOGGER_PRINT_MESSAGES, useValue: print },
      ]);
      instance.log('also printed %JSON', 5);
      expect(print).toHaveBeenCalledTimes(1);
      expect(spy.mock.lastCall?.[0]).toContain('also printed 5');
    });

  });

});
