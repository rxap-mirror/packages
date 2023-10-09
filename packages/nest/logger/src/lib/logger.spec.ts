import { RxapLogger } from '@rxap/nest-logger';

describe('RxapLogger', () => {

  let logger: RxapLogger;

  beforeEach(() => {
    logger = new RxapLogger();
  });

  it.each([ 'log', 'verbose', 'debug', 'warn' ])(
    'should interpolate %JSON with the corresponding optionalParam for the method %s', (method) => {
      const spy = jest.spyOn(logger as any, 'printMessages');
      (
        logger as any
      )[method]('test %JSON', { test: 'test' });
      expect(spy).toHaveBeenCalledWith([ 'test {"test":"test"}' ], undefined, method);
      spy.mockClear();
      (
        logger as any
      )[method]('test %JSON', { test: 'test' }, 'custom-context');
      expect(spy).toHaveBeenCalledWith([ 'test {"test":"test"}' ], 'custom-context', method);
      spy.mockClear();
      (
        logger as any
      )[method]('test %JSON', { test: 'test' }, 'custom-context');
      expect(spy).toHaveBeenCalledWith([ 'test {"test":"test"}' ], 'custom-context', method);
    });

});
