import { map } from 'rxjs/operators';
import { RxapDataSourceError } from './error';
import { PipeDataSource, pipeDataSource } from './pipe.data-source';
import { staticDataSource } from './static.data-source';

describe('PipeDataSource', () => {
  const make = () => staticDataSource([1, 2, 3], { id: 'src' });

  it('applies the operations to the connected source', () => {
    const ds = new PipeDataSource<number[], number>(make() as any, map((a: number[]) => a.length) as any, map((n: number) => n * 2));
    const values: unknown[] = [];
    ds.connect({ id: 'v' }).subscribe((v) => values.push(v));
    expect(values).toEqual([6]);
  });

  it('merges a trailing metadata object into the metadata', () => {
    const ds = pipeDataSource(make(), map((a: number[]) => a), { id: 'src', refreshParent: true });
    expect(ds.metadata['refreshParent']).toBe(true);
  });

  it('refreshes itself or the parent', () => {
    const source = make();
    const parentRefresh = jest.spyOn(source, 'refresh');
    const ds = pipeDataSource(source, map((a: number[]) => a));
    const values: unknown[] = [];
    ds.connect({ id: 'v' }).subscribe((v) => values.push(v));
    ds.refresh();
    expect(values).toHaveLength(2);
    expect(parentRefresh).not.toHaveBeenCalled();
    ds.refresh(true);
    expect(parentRefresh).toHaveBeenCalled();
  });

  it('reset is delegated and toJSON includes the source', () => {
    const source = make();
    const reset = jest.spyOn(source, 'reset');
    const ds = pipeDataSource(source, map((a: number[]) => a));
    ds.reset();
    expect(reset).toHaveBeenCalled();
    expect((ds.toJSON() as any).dataSource).toBe(source);
  });

  it('setOperations after init throws', () => {
    const ds = pipeDataSource(make(), map((a: number[]) => a));
    ds.connect({ id: 'v' }).subscribe();
    expect(() => ds.setOperations(map((a: number[]) => a))).toThrow(RxapDataSourceError);
  });

  it('disconnects the source on destroy', () => {
    const source = make();
    const disconnect = jest.spyOn(source, 'disconnect');
    const ds = pipeDataSource(source, map((a: number[]) => a));
    ds.ngOnDestroy();
    expect(disconnect).toHaveBeenCalled();
  });

  it('works without any operation', () => {
    const ds = new PipeDataSource(make() as any);
    const values: unknown[] = [];
    ds.connect({ id: 'v' }).subscribe((v) => values.push(v));
    expect(values).toEqual([[1, 2, 3]]);
  });
});
