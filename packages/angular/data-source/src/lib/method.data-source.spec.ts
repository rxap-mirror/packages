import { Method } from '@rxap/pattern';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { RxapDataSource } from './base.data-source';
import { MethodDataSource } from './method.data-source';

describe('MethodDataSource', () => {

  interface Data {
    name: string;
  }

  interface Parameters {
    id: string;
  }

  class TestMethod implements Method<Data, Parameters> {

    call(parameters?: Parameters): Promise<Data> | Data {
      return { name: 'test' + (parameters?.id ?? '') };
    }

  }

  @RxapDataSource('test-without-parameters')
  class TestWithoutParametersMethodDataSource extends MethodDataSource<Data> {

    constructor() {
      super(new TestMethod(), true);
    }

  }

  @RxapDataSource('test')
  class TestMethodDataSource extends MethodDataSource<Data> {

    constructor() {
      super(new TestMethod());
    }

  }

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should return data without parameters', async () => {

    const dataSource = new TestWithoutParametersMethodDataSource();

    await new Promise<void>((resolve, reject) => {
      dataSource.connect({ id: 'call' }).subscribe({
        next: data => {
          try {
            expect(data).toEqual({ name: 'test' });
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        error: reject,
      });
    });

  });

  it('should return data with parameters', async () => {

    const dataSource = new TestMethodDataSource();

    await new Promise<void>((resolve, reject) => {
      dataSource.connect({ id: 'call' }).subscribe({
        next: data => {
          try {
            expect(data).toEqual({ name: 'testcall' });
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        error: reject,
      });
    });

  });

});
