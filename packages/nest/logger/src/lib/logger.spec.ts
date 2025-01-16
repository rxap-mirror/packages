import { RxapLogger } from '@rxap/nest-logger';

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

});
