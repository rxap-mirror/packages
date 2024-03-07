import {
  Method,
  ToMethod,
} from '@rxap/pattern';
import { ApplyUseMethodAdapters } from './apply-use-method.adapters';

describe(ApplyUseMethodAdapters.name, () => {

  let method: Method;

  beforeEach(() => {
    method = ToMethod(p => 'original + ' + p);
  });

  it('should not modify the method instance', () => {

    const adapted = ApplyUseMethodAdapters(method);

    expect(adapted).toBe(method);

  });

  it('should apply the parameter adapter', () => {

    const parameterAdapter = jest.fn(p => p + ' p_adapted');

    const adapted = ApplyUseMethodAdapters(method, {
      adapter: {
        parameter: parameterAdapter,
      },
    });

    expect(adapted.call('parameter')).toBe('original + parameter p_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
  });

  it('should apply the result adapter', () => {

    const resultAdapter = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(method, {
      adapter: {
        result: resultAdapter,
      },
    });

    expect(adapted.call('parameter')).toBe('original + parameter r_adapted');
    expect(resultAdapter).toBeCalledWith('original + parameter');
    expect(resultAdapter).toBeCalledTimes(1);
  });

  it('should apply the parameter and result adapter', () => {

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(method, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    expect(adapted.call('parameter')).toBe('original + parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('original + parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);

  });

  it('should apply async result adapter', async () => {

    const asyncMethod = ToMethod(async p => 'original + ' + p);

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(asyncMethod, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    expect(await adapted.call('parameter')).toBe('original + parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('original + parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);

  });

  it('ensure the this context is preserved', () => {

    class TestMethod implements Method {

      name = 'test';

      call(parameter: string) {
        return this.name + ' ' + parameter;
      }

    }

    const complexMethod = new TestMethod();

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(complexMethod, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    expect(adapted.call('parameter')).toBe('test parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('test parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);
  });

});
