import { TestBed } from '@angular/core/testing';
import {
  GetPageAdapterFactory,
  GetPageAdapterFactoryWithOptions,
  GetPageAdapterRemoteMethod,
  GetPageResponse,
} from './get-page-adapter.factory';
import type { OpenApiRemoteMethod } from './open-api.remote-method';

describe('@rxap/open-api/remote-method', () => {

  describe('GetPageAdapterRemoteMethod', () => {

    function createRemoteMethod(response: GetPageResponse<{ id: number }> = {
      total: 7,
      rows: [ { id: 1 }, { id: 2 } ],
    }) {
      return {
        metadata: { id: 'getPage' },
        call: vi.fn().mockResolvedValue(response),
      };
    }

    function create(
      remoteMethod: ReturnType<typeof createRemoteMethod>,
      paginator?: any,
      options?: any,
    ): GetPageAdapterRemoteMethod<{ id: number }> {
      return TestBed.runInInjectionContext(() => new GetPageAdapterRemoteMethod(
        remoteMethod as unknown as OpenApiRemoteMethod,
        paginator,
        options,
      ));
    }

    describe('BuildFilter', () => {

      it('should return an empty filter for empty input', () => {
        expect(GetPageAdapterRemoteMethod.BuildFilter()).toEqual([]);
        expect(GetPageAdapterRemoteMethod.BuildFilter(null)).toEqual([]);
        expect(GetPageAdapterRemoteMethod.BuildFilter('')).toEqual([]);
      });

      it('should ignore a string filter', () => {
        expect(GetPageAdapterRemoteMethod.BuildFilter('name')).toEqual([]);
      });

      it('should create key value pairs and skip empty values', () => {
        expect(GetPageAdapterRemoteMethod.BuildFilter({
          name: 'john',
          age: 30,
          active: false,
          empty: '',
          none: null,
          missing: undefined,
        })).toEqual([ 'name|john', 'age|30', 'active|false' ]);
      });

    });

    describe('call', () => {

      it('should map the table event to the page parameters and return the rows', async () => {
        const remoteMethod = createRemoteMethod();
        const adapter = create(remoteMethod);
        const setTotalLength = vi.fn();

        const rows = await adapter.call({
          page: {
            pageIndex: 2,
            pageSize: 25,
          },
          sort: {
            active: 'name',
            direction: 'desc',
          },
          filter: { name: 'john' },
          setTotalLength,
        } as any);

        expect(rows).toEqual([ { id: 1 }, { id: 2 } ]);
        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: {
            pageIndex: 2,
            pageSize: 25,
            sortBy: 'name',
            sortDirection: 'desc',
            filter: [ 'name|john' ],
          },
        });
        expect(setTotalLength).toHaveBeenCalledWith(7);
      });

      it('should use the defaults if the event has no page, sort and filter', async () => {
        const remoteMethod = createRemoteMethod();
        const adapter = create(remoteMethod);

        await adapter.call({} as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: {
            pageIndex: 0,
            pageSize: 10,
            sortBy: undefined,
            sortDirection: undefined,
            filter: [],
          },
        });
      });

      it('should use the default sort options if the event has no sort', async () => {
        const remoteMethod = createRemoteMethod();
        const adapter = create(remoteMethod, undefined, {
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        await adapter.call({} as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: expect.objectContaining({
            sortBy: 'createdAt',
            sortDirection: 'desc',
          }),
        });
      });

      it('should let the event override the default sort options', async () => {
        const remoteMethod = createRemoteMethod();
        const adapter = create(remoteMethod, undefined, {
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        await adapter.call({
          sort: {
            active: 'name',
            direction: 'asc',
          },
        } as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: expect.objectContaining({
            sortBy: 'name',
            sortDirection: 'asc',
          }),
        });
      });

      it('should merge the additional event parameters into the page parameters', async () => {
        const remoteMethod = createRemoteMethod();
        const adapter = create(remoteMethod);

        await adapter.call({
          page: {
            pageIndex: 0,
            pageSize: 5,
          },
          parameters: {
            tenant: 'a',
            pageSize: 50,
          },
        } as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: expect.objectContaining({
            tenant: 'a',
            pageSize: 50,
          }),
        });
      });

      it('should update the paginator length', async () => {
        const remoteMethod = createRemoteMethod();
        const paginator = {
          length: 0,
          pageIndex: 0,
          pageSize: 10,
        };
        const adapter = create(remoteMethod, paginator);

        await adapter.call({} as any);

        expect(paginator.length).toBe(7);
      });

    });

    describe('factories', () => {

      it('should create the adapter with the factory function', async () => {
        const remoteMethod = createRemoteMethod();
        const paginator = {
          length: 0,
          pageIndex: 0,
          pageSize: 10,
        };

        const adapter = TestBed.runInInjectionContext(
          () => GetPageAdapterFactory(remoteMethod as unknown as OpenApiRemoteMethod, paginator),
        );

        expect(adapter).toBeInstanceOf(GetPageAdapterRemoteMethod);
        expect(adapter.metadata.id).toBe('getPage');
        await adapter.call({} as any);
        expect(paginator.length).toBe(7);
      });

      it('should create the adapter with default options', async () => {
        const remoteMethod = createRemoteMethod();

        const adapter = TestBed.runInInjectionContext(
          () => GetPageAdapterFactoryWithOptions({ sortBy: 'name' })(remoteMethod as unknown as OpenApiRemoteMethod),
        );
        await adapter.call({} as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: expect.objectContaining({ sortBy: 'name' }),
        });
      });

      it('should create the adapter with empty default options', async () => {
        const remoteMethod = createRemoteMethod();

        const adapter = TestBed.runInInjectionContext(
          () => GetPageAdapterFactoryWithOptions()(remoteMethod as unknown as OpenApiRemoteMethod),
        );
        await adapter.call({} as any);

        expect(remoteMethod.call).toHaveBeenCalledWith({
          parameters: expect.objectContaining({ sortBy: undefined }),
        });
      });

    });

  });

});
