import {
  InjectionToken,
  INJECTOR,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Method,
  ToMethod,
} from '@rxap/pattern';
import { ApplyUseMethodAdapters } from './apply-use-method.adapters';

describe(ApplyUseMethodAdapters.name, () => {

  let method: Method;
  let injector: Injector;
  const token = new InjectionToken('test');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: token,
          useValue: 'test',
        }
      ]
    });
    injector = TestBed.inject(INJECTOR);
    method = ToMethod(p => 'original + ' + p);
  });

  it('should not modify the method instance', () => {

    const adapted = ApplyUseMethodAdapters(injector, method);

    expect(adapted).toBe(method);

  });

  it('should be able to inject token in the parameter adapter function', async () => {

    const parameterAdapter = (p: any) => {
      expect(injector.get(token)).toBe('test');
      return p + '_inject';
    };

    const adapted = ApplyUseMethodAdapters(injector, method, {
      adapter: {
        parameter: parameterAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('original + parameter_inject');

  });

  it('should apply the parameter adapter', async () => {

    const parameterAdapter = jest.fn(p => p + ' p_adapted');

    const adapted = ApplyUseMethodAdapters(injector, method, {
      adapter: {
        parameter: parameterAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('original + parameter p_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
  });

  it('should apply the result adapter', async () => {

    const resultAdapter = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(injector, method, {
      adapter: {
        result: resultAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('original + parameter r_adapted');
    expect(resultAdapter).toBeCalledWith('original + parameter');
    expect(resultAdapter).toBeCalledTimes(1);
  });

  it('should apply the parameter and result adapter', async () => {

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(injector, method, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('original + parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('original + parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);

  });

  it('should apply async result adapter', async () => {

    const asyncMethod = ToMethod(async p => 'original + ' + p);

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(injector, asyncMethod, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('original + parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('original + parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);

  });

  it('ensure the this context is preserved', async () => {

    class TestMethod implements Method {

      name = 'test';

      call(parameter: string) {
        return this.name + ' ' + parameter;
      }

    }

    const complexMethod = new TestMethod();

    const parameterAdapter = jest.fn(p => p + ' p_adapted');
    const resultAdapter    = jest.fn(r => r + ' r_adapted');

    const adapted = ApplyUseMethodAdapters(injector, complexMethod, {
      adapter: {
        parameter: parameterAdapter,
        result: resultAdapter,
      },
    });

    await expect(adapted.call('parameter')).resolves.toBe('test parameter p_adapted r_adapted');
    expect(parameterAdapter).toBeCalledWith('parameter');
    expect(parameterAdapter).toBeCalledTimes(1);
    expect(resultAdapter).toBeCalledWith('test parameter p_adapted');
    expect(resultAdapter).toBeCalledTimes(1);
  });

});
