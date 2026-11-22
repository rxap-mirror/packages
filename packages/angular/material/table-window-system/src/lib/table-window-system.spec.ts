import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ComponentRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { BaseDataSource, DataSourceLoader } from '@rxap/data-source';
import { RxapFormControl } from '@rxap/forms';
import {
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  RXAP_TABLE_METHOD,
  TABLE_DATA_SOURCE,
  TABLE_REMOTE_METHOD,
} from '@rxap/material-table-system';
import { RXAP_WINDOW_SETTINGS, WindowService } from '@rxap/window-system';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { OpenTableSelectDirective } from './open-table-select.directive';
import { WindowTableSelectService } from './window-table-select.service';

describe('WindowTableSelectService', () => {
  let service: WindowTableSelectService;
  let windowService: { open: jest.Mock };
  let windowRef: any;

  beforeAll(() => {
    ((globalThis as any).$localize as jest.Mock).mockImplementation(
      (s: TemplateStringsArray) => s[0].replace(/^:[^:]*:/, ''),
    );
  });

  beforeEach(() => {
    windowRef = {
      attachedRef$: new Subject<any>(),
      closed$: new Subject<any>(),
      setFooterPortal: jest.fn(),
    };
    windowService = { open: jest.fn().mockReturnValue(windowRef) };
    TestBed.configureTestingModule({
      providers: [{ provide: WindowService, useValue: windowService }],
    });
    service = TestBed.inject(WindowTableSelectService);
  });

  function providersOf(injector: Injector) {
    return {
      options: injector.get(RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS),
      settings: injector.get(RXAP_WINDOW_SETTINGS),
      dataSource: injector.get(TABLE_DATA_SOURCE),
      remote: injector.get(TABLE_REMOTE_METHOD),
      method: injector.get(RXAP_TABLE_METHOD),
    };
  }

  class Cmp {}

  it('opens a window with default providers and no data source', () => {
    const promise = service.open(Cmp, { injector: TestBed.inject(Injector) });
    const cfg = windowService.open.mock.calls[0][0];
    expect(cfg.component).toBe(Cmp);
    const p = providersOf(cfg.injector);
    expect(p.options).toEqual({ multiple: false, selected: [] });
    expect(p.settings).toEqual({ title: 'Select Options' });
    expect(p.dataSource).toBeNull();
    expect(p.remote).toBeNull();
    expect(p.method).toBeNull();
    expect(promise.windowRef).toBe(windowRef);
  });

  it('uses title, multiple, selected and data from the options', () => {
    const data = { metadata: { id: 'x' }, connect: jest.fn(), disconnect: jest.fn() } as any as BaseDataSource<any[]>;
    service.open(Cmp, {
      injector: TestBed.inject(Injector),
      title: 'T',
      multiple: true,
      selected: [{ id: 1 }],
      data,
    });
    const p = providersOf(windowService.open.mock.calls[0][0].injector);
    expect(p.options).toEqual({ multiple: true, selected: [{ id: 1 }] });
    expect(p.settings.title).toBe('T');
    expect(p.dataSource).toBeTruthy();
  });

  it('resolves with the selected rows or an empty array', async () => {
    const promise = service.open(Cmp, { injector: TestBed.inject(Injector) });
    windowRef.closed$.next([{ id: 1 }]);
    await expect(promise).resolves.toEqual([{ id: 1 }]);
    const promise2 = service.open(Cmp, { injector: TestBed.inject(Injector) });
    windowRef.closed$.next(undefined);
    await expect(promise2).resolves.toEqual([]);
  });

  it('attaches the footer portal for component refs', () => {
    service.open(Cmp, { injector: TestBed.inject(Injector) });
    const ref = Object.create(ComponentRef.prototype);
    Object.defineProperty(ref, 'injector', { value: TestBed.inject(Injector) });
    windowRef.attachedRef$.next(ref);
    expect(windowRef.setFooterPortal).toHaveBeenCalledWith(expect.any(ComponentPortal));
  });

  it('throws when the attached ref is not a component ref', () => {
    service.open(Cmp, { injector: TestBed.inject(Injector) });
    jest.useFakeTimers();
    try {
      windowRef.attachedRef$.next({});
      // rxjs reports the error of the unhandled subscription asynchronously
      expect(() => jest.runAllTimers()).toThrow('FATAL: the attached ref was not an instance of Component ref');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('OpenTableSelectDirective', () => {
  let control: any;
  let formField: any;
  let loader: { load: jest.Mock };
  let openMethod: { call: jest.Mock };
  let valueSpy: jest.SpyInstance;

  @Component({
    template: `<button [rxapOpenTableSelect]="method"></button>`,
    imports: [OpenTableSelectDirective],
  })
  class HostComponent {
    method: any = openMethod;
  }

  function create(setup?: (d: OpenTableSelectDirective<any>) => void) {
    const f = TestBed.createComponent(HostComponent);
    // spy before ngOnInit through prototype
    f.detectChanges();
    const dir = f.debugElement.children[0].injector.get(OpenTableSelectDirective);
    setup?.(dir);
    return { f, dir };
  }

  const source$ = new BehaviorSubject<any[]>([{ value: 1 }, { value: 2 }]);
  const dataSource: any = {
    metadata: { id: 'ds' },
    connect: () => source$,
    disconnect: jest.fn(),
    retry: jest.fn(),
  };

  beforeEach(() => {
    control = new RxapFormControl('x', { controlId: 'c' } as any, undefined as any);
    control = Object.assign(Object.create(RxapFormControl.prototype), { controlId: 'c', value: undefined, setValue: jest.fn() });
    formField = { _control: { ngControl: { control } } };
    loader = { load: jest.fn().mockReturnValue(dataSource) };
    openMethod = { call: jest.fn() };
    valueSpy = jest.spyOn(OpenTableSelectDirective.prototype as any, 'extractDataSourceValue').mockReturnValue({
      dataSource: 'ds',
      settings: undefined,
    });
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_FORM_FIELD, useValue: formField },
        { provide: DataSourceLoader, useValue: loader },
      ],
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it('throws without a control', () => {
    formField._control.ngControl = null;
    expect(() => TestBed.createComponent(HostComponent).detectChanges()).toThrow(
      'Could not extract the control from the form field',
    );
  });

  it('throws for a non rxap control', () => {
    formField._control.ngControl.control = {};
    expect(() => TestBed.createComponent(HostComponent).detectChanges()).toThrow(
      'The control is not an instance of RxapFormControl',
    );
  });

  it('loads the options data source on init', () => {
    create();
    expect(loader.load).toHaveBeenCalledWith('ds', undefined, expect.anything());
  });

  it('opens the table select and sets a single value', async () => {
    openMethod.call.mockReturnValue(Promise.resolve([{ id: 5 }, { id: 6 }]));
    const { dir } = create();
    await dir.onClick();
    const args = openMethod.call.mock.calls[0][0];
    expect(args.multiple).toBe(false);
    expect(args.selected).toEqual([]);
    expect(control.setValue).toHaveBeenCalledWith({ id: 5 });
  });

  it('sets the full selection for a multiple select', async () => {
    const { MatSelect } = await import('@angular/material/select');
    formField._control = Object.assign(Object.create(MatSelect.prototype), {
      ngControl: { control },
      multiple: true,
    });
    control.value = [1];
    openMethod.call.mockReturnValue(Promise.resolve([{ id: 5 }, { id: 6 }]));
    const { dir } = create();
    await dir.onClick();
    expect(openMethod.call.mock.calls[0][0].multiple).toBe(true);
    expect(openMethod.call.mock.calls[0][0].selected).toEqual([1]);
    expect(control.setValue).toHaveBeenCalledWith([{ id: 5 }, { id: 6 }]);
  });

  it('sets null when an empty selection is returned and ignores non arrays', async () => {
    openMethod.call.mockReturnValue(Promise.resolve([]));
    const { dir } = create();
    await dir.onClick();
    expect(control.setValue).toHaveBeenCalledWith(null);
    control.setValue.mockClear();
    openMethod.call.mockReturnValue(Promise.resolve(undefined));
    await dir.onClick();
    expect(control.setValue).not.toHaveBeenCalled();
  });

  it('completes the window ref on destroy while the window is open', async () => {
    const windowRef = { complete: jest.fn() };
    let resolve!: (v: any) => void;
    const p: any = new Promise((r) => (resolve = r));
    p.windowRef = windowRef;
    openMethod.call.mockReturnValue(p);
    const { f, dir } = create();
    const pending = dir.onClick();
    f.destroy();
    expect(windowRef.complete).toHaveBeenCalled();
    resolve([]);
    await pending;
  });

  describe('mixin helpers', () => {
    let dir: any;
    beforeEach(() => {
      dir = create().dir;
      valueSpy.mockRestore();
    });

    it('throws when no control is available', () => {
      dir.control = undefined;
      expect(() => dir.extractDataSourceValue('options')).toThrow('The control is not defined');
      expect(() => dir.extractDataSourceTransformer('options')).toThrow('The control is not defined');
    });

    it('throws for an unknown data source name', () => {
      jest.spyOn(dir, 'extractFormDefinition').mockReturnValue({});
      jest.spyOn(dir, 'extractDataSources').mockReturnValue(new Map());
      expect(() => dir.extractDataSourceValue('options', control)).toThrow('is not defined');
    });

    it('applies the transformer of the data source settings', () => {
      const transformer = (v: any) => v;
      jest.spyOn(dir, 'extractFormDefinition').mockReturnValue({});
      jest.spyOn(dir, 'extractDataSources').mockReturnValue(
        new Map([['options', { dataSource: 'ds', settings: { transformer: (v: any) => [v] } }]]) as any,
      );
      const ds = dir.extractDatasource('options', control);
      expect(ds).toBe(dir.dataSource);
      expect(ds).not.toBe(dataSource);
      expect(dir.extractDataSourceTransformer('options', control)([1])).toEqual([[1]]);
      jest.spyOn(dir, 'extractDataSources').mockReturnValue(
        new Map([['options', { dataSource: 'ds' }]]) as any,
      );
      expect(dir.extractDataSourceTransformer('options', control)(7)).toBe(7);
      expect(transformer(1)).toBe(1);
    });
  });
});
