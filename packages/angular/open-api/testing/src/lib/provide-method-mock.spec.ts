import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MethodWithParameters } from '@rxap/pattern';
import {
  ProvideMethodMock,
  ProvideMethodWithParametersMock,
  ProvideRemoteMethodMock,
} from './provide-method-mock';
import {
  PageDto,
  ProvideRxapNestjsGetPageMethod,
} from './provide-rxap-nestjs-get-page-method';

describe('@rxap/open-api/testing', () => {

  describe('ProvideMethodMock', () => {

    const TOKEN = new InjectionToken<any>('method');

    function inject(provider: any) {
      TestBed.configureTestingModule({ providers: [ provider ] });
      return TestBed.inject(TOKEN);
    }

    it('should resolve the implementation result as promise', async () => {
      const method = inject(ProvideMethodMock(TOKEN, (parameters?: any) => ({ got: parameters })));

      expect(await method.call({ a: 1 })).toEqual({ got: { a: 1 } });
    });

    it('should pass through a promise returned by the implementation', async () => {
      const method = inject(ProvideMethodMock(TOKEN, () => Promise.resolve('async')));

      expect(await method.call()).toBe('async');
    });

    it('should resolve undefined for the default implementation', async () => {
      const method = inject(ProvideMethodMock(TOKEN));

      expect(await method.call()).toBeUndefined();
    });

    it('should delay the result', async () => {
      vi.useFakeTimers();
      try {
        const method = inject(ProvideMethodMock(TOKEN, () => 'delayed', 100));
        const resolved = vi.fn();

        method.call().then(resolved);
        await vi.advanceTimersByTimeAsync(99);
        expect(resolved).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(resolved).toHaveBeenCalledWith('delayed');
      } finally {
        vi.useRealTimers();
      }
    });

  });

  describe('ProvideMethodWithParametersMock', () => {

    const TOKEN = new InjectionToken<MethodWithParameters<any, any>>('method-with-parameters');

    function inject(provider: any) {
      TestBed.configureTestingModule({ providers: [ provider ] });
      return TestBed.inject(TOKEN);
    }

    it('should call the implementation with the parameters', async () => {
      const implementation = vi.fn((parameters: { a: number }, extra?: string) => ({
        ...parameters,
        extra,
      }));
      const method = inject(ProvideMethodWithParametersMock(TOKEN, implementation));

      expect(await method.call({ a: 1 }, 'x' as any)).toEqual({
        a: 1,
        extra: 'x',
      });
      expect(implementation).toHaveBeenCalledWith({ a: 1 }, 'x');
    });

    it('should pass through a promise returned by the implementation', async () => {
      const method = inject(ProvideMethodWithParametersMock(TOKEN, () => Promise.resolve('async')));

      expect(await method.call({})).toBe('async');
    });

    it('should throw if the parameters are missing and no default is defined', () => {
      const method = inject(ProvideMethodWithParametersMock(TOKEN, () => 'value'));

      expect(() => (method as any).call()).toThrow('Method requires a parameter');
    });

    it('should use the default parameters', async () => {
      const implementation = vi.fn(() => 'value');
      const method = inject(ProvideMethodWithParametersMock(TOKEN, implementation, undefined, { d: 1 }));

      expect(await (method as any).call()).toBe('value');
      expect(implementation).toHaveBeenCalledWith({ d: 1 });
    });

    it('should delay the result', async () => {
      vi.useFakeTimers();
      try {
        const method = inject(ProvideMethodWithParametersMock(TOKEN, () => 'delayed', 50));
        const resolved = vi.fn();

        method.call({}).then(resolved);
        await vi.advanceTimersByTimeAsync(50);

        expect(resolved).toHaveBeenCalledWith('delayed');
      } finally {
        vi.useRealTimers();
      }
    });

  });

  describe('ProvideRemoteMethodMock', () => {

    const TOKEN = new InjectionToken<any>('remote-method');

    it('should call the implementation with an empty parameter object by default', async () => {
      const implementation = vi.fn(() => 'value');
      TestBed.configureTestingModule({ providers: [ ProvideRemoteMethodMock(TOKEN, implementation) ] });
      const method = TestBed.inject(TOKEN);

      expect(await method.call()).toBe('value');
      expect(implementation).toHaveBeenCalledWith({});
    });

    it('should call the implementation with the passed parameters', async () => {
      const implementation = vi.fn((input: any) => input.parameters.id);
      TestBed.configureTestingModule({ providers: [ ProvideRemoteMethodMock(TOKEN, implementation) ] });
      const method = TestBed.inject(TOKEN);

      expect(await method.call({ parameters: { id: 'x' } })).toBe('x');
    });

  });

  describe('ProvideRxapNestjsGetPageMethod', () => {

    interface Row {
      id: number;
      name: string;
    }

    const TOKEN = new InjectionToken<any>('get-page');
    const data: Row[] = [
      {
        id: 1,
        name: 'Charlie',
      },
      {
        id: 2,
        name: 'alice',
      },
      {
        id: 3,
        name: 'Bob',
      },
      {
        id: 4,
        name: 'alicia',
      },
    ];

    let method: { call: (input: any) => Promise<PageDto<Row>> };

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [ ProvideRxapNestjsGetPageMethod(TOKEN as any, data) ] });
      method = TestBed.inject(TOKEN);
    });

    async function call(parameters: any): Promise<PageDto<Row>> {
      return method.call({ parameters });
    }

    it('should warn and return an empty page without parameters', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const page = await method.call({});

      expect(page).toEqual({
        rows: [],
        pageSize: 0,
        pageIndex: 0,
        total: 0,
      });
      expect(warn).toHaveBeenCalledWith('No parameters provided');
      warn.mockRestore();
    });

    it('should return the requested page', async () => {
      const page = await call({
        pageIndex: 1,
        pageSize: 3,
      });

      expect(page.rows).toEqual([ data[3] ]);
      expect(page.total).toBe(4);
      expect(page.pageIndex).toBe(1);
      expect(page.pageSize).toBe(3);
    });

    it('should not sort without a sort direction', async () => {
      const page = await call({
        pageIndex: 0,
        pageSize: 10,
        sortBy: 'name',
      });

      expect(page.rows.map(row => row.id)).toEqual([ 1, 2, 3, 4 ]);
    });

    it('should sort ascending and descending', async () => {
      const asc = await call({
        pageIndex: 0,
        pageSize: 10,
        sortBy: 'name',
        sortDirection: 'asc',
      });
      const desc = await call({
        pageIndex: 0,
        pageSize: 10,
        sortBy: 'name',
        sortDirection: 'desc',
      });

      expect(asc.rows.map(row => row.name)).toEqual([ 'alice', 'alicia', 'Bob', 'Charlie' ]);
      expect(desc.rows.map(row => row.name)).toEqual([ 'Charlie', 'Bob', 'alicia', 'alice' ]);
      expect(asc.sortBy).toBe('name');
      expect(asc.sortDirection).toBe('asc');
    });

    it('should filter the rows', async () => {
      const page = await call({
        pageIndex: 0,
        pageSize: 10,
        filter: [ 'name|ali' ],
      });

      expect(page.rows.map(row => row.id)).toEqual([ 2, 4 ]);
      expect(page.total).toBe(2);
      expect(page.filter).toEqual([ 'name|ali' ]);
    });

    it('should not modify the source data when sorting', async () => {
      await call({
        pageIndex: 0,
        pageSize: 10,
        sortBy: 'name',
        sortDirection: 'desc',
      });

      expect(data.map(row => row.id)).toEqual([ 1, 2, 3, 4 ]);
    });

  });

});
