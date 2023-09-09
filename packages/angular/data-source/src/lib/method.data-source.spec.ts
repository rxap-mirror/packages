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

  it('should return data without parameters', done => {

    const dataSource = new TestWithoutParametersMethodDataSource();

    dataSource.connect({ id: 'call' }).subscribe(data => {
      expect(data).toEqual({ name: 'test' });
      done();
    });

  });

  it('should return data with parameters', done => {

    const dataSource = new TestMethodDataSource();

    dataSource.connect({ id: 'call' }).subscribe(data => {
      expect(data).toEqual({ name: 'testcall' });
      done();
    });

  });

});
