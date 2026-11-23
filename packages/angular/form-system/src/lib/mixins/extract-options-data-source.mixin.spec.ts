import { InjectionToken, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { BaseDataSource, DataSourceLoader } from '@rxap/data-source';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  ExtractOptionsDataSourceMixin,
  UseOptionsDataSource,
} from './extract-options-data-source.mixin';

class OptionsSource extends BaseDataSource<any> {
  readonly options$ = new BehaviorSubject<any>([ { value: 1, display: 'One' } ]);

  constructor() {
    super({ id: 'extract-options-source' });
  }

  protected override _connect() {
    return this.options$.asObservable();
  }
}

const source = new OptionsSource();
const MISSING = new InjectionToken<BaseDataSource>('extract-options-missing-source');

interface IForm {
  plain: string;
  transformed: string;
  missing: string;
  none: string;
}

@RxapForm('extract-options-data-source-test')
class TestForm implements FormType<IForm> {
  @UseOptionsDataSource(source)
  @UseFormControl()
  plain!: RxapFormControl<string>;

  @UseOptionsDataSource(source, { transformer: (options: any[]) => options.map((o) => ({ ...o, display: o.display.toUpperCase() })) })
  @UseFormControl()
  transformed!: RxapFormControl<string>;

  @UseOptionsDataSource(MISSING)
  @UseFormControl()
  missing!: RxapFormControl<string>;

  @UseFormControl()
  none!: RxapFormControl<string>;
}

describe('ExtractOptionsDataSourceMixin', () => {

  @Mixin(ExtractOptionsDataSourceMixin)
  class Probe {
    ngControl: any = null;
    injector!: Injector;
    dataSourceLoader!: DataSourceLoader;
    [key: string]: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Probe extends ExtractOptionsDataSourceMixin {}

  let form: any;
  let probe: Probe;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    form = new RxapFormBuilder<IForm>(TestForm).build();
    probe = new Probe();
    probe.injector = TestBed.inject(Injector);
    probe.dataSourceLoader = TestBed.inject(DataSourceLoader);
  });

  afterEach(() => vi.restoreAllMocks());

  it('extracts the control from the ngControl when no control is given', () => {
    probe.ngControl = { control: form.plain };
    const dataSource = probe['extractOptionsDatasource']();
    expect(dataSource).toBeDefined();
    expect(probe['dataSource']).toBe(dataSource);
  });

  it('rejects a control that is not a RxapFormControl', () => {
    expect(() => probe['extractOptionsDatasource'](new FormControl(''))).toThrow('Ensure to use a RxapFromControl');
  });

  it('throws when the control has no options data source', () => {
    expect(() => probe['extractOptionsDatasource'](form.none)).toThrow(/does not exists/);
  });

  it('tracks the last value emitted by the data source', async () => {
    const dataSource = probe['extractOptionsDatasource'](form.plain);
    expect(probe['useDataSourceValue']!.lastValue).toBeUndefined();
    const options = await firstValueFrom(dataSource.connect({ id: 'test' }));
    expect(options).toEqual([ { value: 1, display: 'One' } ]);
    expect(probe['useDataSourceValue']!.lastValue).toEqual([ { value: 1, display: 'One' } ]);
    expect(probe['settings']).toEqual({});
  });

  it('applies the transformer of the settings before tracking the last value', async () => {
    const dataSource = probe['extractOptionsDatasource'](form.transformed);
    const options = await firstValueFrom(dataSource.connect({ id: 'test' }));
    expect(options).toEqual([ { value: 1, display: 'ONE' } ]);
    expect(probe['useDataSourceValue']!.lastValue).toEqual([ { value: 1, display: 'ONE' } ]);
    expect(probe['settings']?.transformer).toBeTypeOf('function');
  });

  it('wraps an injection error of the data source token in a descriptive error', () => {
    expect(() => probe['extractOptionsDatasource'](form.missing)).toThrow(/Cloud not inject the options data source/);
    expect(console.error).toHaveBeenCalledWith(
      'Cloud not inject the options data source',
      expect.objectContaining({ dataSource: MISSING }),
    );
  });

  it('rethrows other errors of the data source loader unchanged', () => {
    const error = new Error('boom');
    probe.dataSourceLoader = { load: () => { throw error; } } as any;
    expect(() => probe['extractOptionsDatasource'](form.plain)).toThrow(error);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('passes the metadata and the injector to the data source loader', () => {
    const load = vi.fn().mockReturnValue(source);
    probe.dataSourceLoader = { load } as any;
    const metadata = { id: 'custom-viewer' };
    probe['extractOptionsDatasource'](form.plain, metadata);
    expect(load).toHaveBeenCalledWith(source, metadata, probe.injector);
  });

});
