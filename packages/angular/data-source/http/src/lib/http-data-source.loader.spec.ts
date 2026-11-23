import { TestBed } from '@angular/core/testing';
import { DataSourceLoader, RxapDataSourceError } from '@rxap/data-source';
import { HttpDataSource } from './http.data-source';
import { HttpDataSourceLoader } from './http-data-source.loader';

describe('HttpDataSourceLoader', () => {
  it('requests through an HttpDataSource', async () => {
    const fake = Object.create(HttpDataSource.prototype);
    fake.request$ = vi.fn().mockResolvedValue('res');
    vi.spyOn(TestBed.inject(DataSourceLoader), 'load').mockReturnValue(fake);
    await expect(TestBed.inject(HttpDataSourceLoader).request$('x' as any, { queryParams: { a: 1 } } as any, true)).resolves.toBe('res');
    expect(fake.request$).toHaveBeenCalledWith({ queryParams: { a: 1 } }, true);
  });

  it('rejects other data sources', () => {
    vi.spyOn(TestBed.inject(DataSourceLoader), 'load').mockReturnValue({} as any);
    expect(() => TestBed.inject(HttpDataSourceLoader).request$('x' as any)).toThrow(RxapDataSourceError);
  });
});
