import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RxapDataSource } from '@rxap/data-source';
import { Subject } from 'rxjs';
import { AccordionDataSource, AccordionDataSourceMethod } from './accordion.data-source';
import { PanelAccordionDataSource } from './panel-accordion.data-source';
import { ACCORDION_DATA_SOURCE } from './tokens';

const flush = () => new Promise<void>((r) => setTimeout(r));

function method(fn: (p: any) => any): AccordionDataSourceMethod<any, any> {
  return { call: vi.fn(fn) } as any;
}

@RxapDataSource({ id: 'acc' })
@Injectable()
class TestAccordion extends AccordionDataSource<string, { id: number }> {
  params: any = { id: 1 };
  protected override readonly method = method((p) => Promise.resolve('data-' + p.id));
  getParameters() { return this.params; }
  m() { return this.method; }
}

@RxapDataSource({ id: 'panel' })
@Injectable()
class TestPanel extends PanelAccordionDataSource<string, { id: number }> {
  protected override readonly method = method((p) => Promise.resolve('panel-' + p.id));
}

describe('AccordionDataSource', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => vi.restoreAllMocks());

  const create = (cls = TestAccordion, extra: any[] = []) => {
    TestBed.configureTestingModule({ providers: [cls, ...extra] });
    return TestBed.inject(cls);
  };

  it('loads synchronous parameters on init', async () => {
    const ds = create();
    const values: string[] = [];
    ds._data$.subscribe((v) => values.push(v));
    ds.ngOnInit();
    await flush();
    expect(values).toEqual(['data-1']);
    expect(ds.m().call).toHaveBeenCalledWith({ id: 1 });
  });

  it('loads promise parameters', async () => {
    const ds = create();
    ds.params = Promise.resolve({ id: 2 });
    const values: string[] = [];
    ds._data$.subscribe((v) => values.push(v));
    ds.ngOnInit();
    await flush();
    expect(values).toEqual(['data-2']);
  });

  it('reloads for every emission of observable parameters and unsubscribes on destroy', async () => {
    const ds = create();
    const params$ = new Subject<{ id: number }>();
    ds.params = params$;
    const values: string[] = [];
    ds._data$.subscribe((v) => values.push(v));
    ds.ngOnInit();
    params$.next({ id: 1 });
    params$.next({ id: 2 });
    await flush();
    expect(values).toEqual(['data-1', 'data-2']);
    ds.ngOnDestroy();
    expect(params$.observed).toBe(false);
  });

  it('flags errors from the method and resets loading', async () => {
    const ds = create();
    (ds as any).method = method(() => Promise.reject(new Error('x')));
    let hasError = false;
    let loading = true;
    ds.hasError$.subscribe((v: boolean) => (hasError = v));
    ds.loading$.subscribe((v: boolean) => (loading = v));
    ds.ngOnInit();
    await flush();
    expect(hasError).toBe(true);
    expect(loading).toBe(false);
  });

  it('load rejects without parameters', async () => {
    const ds = create();
    await expect((ds as any).load()).rejects.toThrow(/parameters are not set/);
  });

  it('refresh reloads and announces on refresh$', async () => {
    const ds = create();
    ds.ngOnInit();
    await flush();
    const spy = vi.fn();
    ds.refresh$.subscribe(spy);
    ds.refresh();
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ds.m().call).toHaveBeenCalledTimes(2);
  });

  it('PanelAccordionDataSource takes the parameters from the parent and refreshes with it', async () => {
    TestBed.configureTestingModule({
      providers: [TestAccordion, TestPanel, { provide: ACCORDION_DATA_SOURCE, useExisting: TestAccordion }],
    });
    const parent = TestBed.inject(TestAccordion);
    const panel = TestBed.inject(TestPanel);
    const values: string[] = [];
    panel._data$.subscribe((v) => values.push(v));
    panel.ngOnInit();
    await flush();
    expect(values).toEqual(['panel-1']);
    parent.ngOnInit();
    await flush();
    parent.refresh();
    await flush();
    expect(values.length).toBeGreaterThanOrEqual(2);
    panel.ngOnDestroy();
  });
});
