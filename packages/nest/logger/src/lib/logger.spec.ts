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

  it.each([true, false])('should interpolate %JSON with boolean value %b', (bool) => {

    const spy = jest.spyOn(logger as any, 'printMessages');
    logger.log('test %JSON', bool);
    expect(spy).toHaveBeenCalledWith([ `test ${JSON.stringify(bool)}` ], undefined, 'log');

  });

  it.each([-1, 0, 1])('should interpolate %JSON with number value: %i', (num) => {

    const spy = jest.spyOn(logger as any, 'printMessages');
    logger.log('test %JSON', num);
    expect(spy).toHaveBeenCalledWith([ `test ${JSON.stringify(num)}` ], undefined, 'log');

  });

  it.each(['text', ''])('should interpolate %JSON with string value: %s', (str) => {

    const spy = jest.spyOn(logger as any, 'printMessages');
    logger.log('test %JSON', str);
    expect(spy).toHaveBeenCalledWith([ `test ${JSON.stringify(str)}` ], undefined, 'log');

  });

  it('should interpolate %JSON with null value', () => {
    const spy = jest.spyOn(logger as any, 'printMessages');
    logger.log('test %JSON', null);
    expect(spy).toHaveBeenCalledWith([ `test <null>` ], undefined, 'log');
  });

  it('should interpolate %JSON with undefined value', () => {
    const spy = jest.spyOn(logger as any, 'printMessages');
    logger.log('test %JSON', undefined);
    expect(spy).toHaveBeenCalledWith([ `test <undefined>` ], undefined, 'log');
  });

});
