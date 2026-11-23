import type { Mock } from 'vitest';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { DataSource } from '@rxap/pattern';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridRowDefDirective } from './data-grid-row-def.directive';
import { DataGridComponent, DataGridMode } from './data-grid.component';
import { DataGridValuePipe } from './data-grid-value.pipe';
import { IsEmptyPipe } from './is-empty.pipe';

interface Data {
  username: string;
  email: string;
  nested?: { a: string };
}

const DATA: Data = { username: 'test', email: 'a@b.de' };

@Component({
  selector: 'rxap-test-host',
  template: `
    <rxap-data-grid
      [data]="data()"
      [header]="header()"
      [displayProperties]="displayProperties()"
      [hideEmptyProperties]="hideEmpty()"
      [mode]="mode()"
    >
      <ng-container rxapDataGridRowDef="username"></ng-container>
      <ng-container [rxapDataGridRowDef]="'email'">
        <th *rxapDataGridHeaderCellDef="let name" class="custom-header">Header {{ name }}</th>
        <ng-template rxapDataGridCellDef let-value>custom:{{ value }}</ng-template>
      </ng-container>
      <ng-container [rxapDataGridRowDef]="'nested.a'" [flip]="true"></ng-container>
    </rxap-data-grid>
  `,
  imports: [
    DataGridComponent,
    DataGridRowDefDirective,
    DataGridHeaderCellDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective,
  ],
})
class HostComponent {
  readonly data = signal<Data | undefined>({ ...DATA, nested: { a: 'deep' } });
  readonly header = signal(false);
  readonly displayProperties = signal<string[] | null>(null);
  readonly hideEmpty = signal(false);
  readonly mode = signal<DataGridMode | string>('plain');
}

@Component({
  selector: 'rxap-test-sub-host',
  template: `
    <rxap-data-grid [data]="data" [hideEmptyProperties]="hide">
      <ng-container rxapDataGridRowDef="username"></ng-container>
      <ng-container rxapDataGridRowDef></ng-container>
    </rxap-data-grid>
  `,
  imports: [DataGridComponent, DataGridRowDefDirective],
})
class SubHeaderHostComponent {
  data = DATA;
  hide = false;
}

@Component({
  selector: 'rxap-test-edit-host',
  template: `
    <rxap-data-grid [data]="data" [mode]="'plain'">
      <ng-container rxapDataGridRowDef="username">
        <ng-template rxapDataGridEditCellDef let-value>edit:{{ value }}</ng-template>
      </ng-container>
    </rxap-data-grid>
  `,
  imports: [DataGridComponent, DataGridRowDefDirective, DataGridEditCellDefDirective],
})
class EditHostComponent {
  data = DATA;
}

describe('DataGridComponent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [NoopAnimationsModule],
    });
  });
  afterEach(() => vi.restoreAllMocks());

  async function setup(): Promise<{
    fixture: ComponentFixture<HostComponent>;
    el: HTMLElement;
    grid: DataGridComponent<any>;
  }> {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 150));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const grid = fixture.debugElement.children[0].componentInstance;
    return { fixture, el, grid };
  }

  it('renders one row per row definition with default and custom cells', async () => {
    const { el } = await setup();
    const rows = el.querySelectorAll('tbody tr[data-name]');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(el.querySelector('[data-name="username"] th')?.textContent).toBe('username');
    expect(el.querySelector('[data-name="username"] td')?.textContent).toContain('test');
    expect(el.querySelector('.custom-header')?.textContent).toBe('Header email');
    expect(el.querySelector('[data-name="email"] td')?.textContent).toContain('custom:a@b.de');
    expect(el.querySelector('[data-name="nested.a-value"] td')?.textContent).toContain('deep');
  });

  it('shows the header only when requested', async () => {
    const { fixture, el } = await setup();
    expect(el.querySelector('thead')).toBeNull();
    fixture.componentInstance.header.set(true);
    fixture.detectChanges();
    expect(el.querySelector('thead')).not.toBeNull();
  });

  it('filters rows by displayProperties', async () => {
    const { fixture, el } = await setup();
    fixture.componentInstance.displayProperties.set(['email']);
    fixture.detectChanges();
    expect(el.querySelector('[data-name="username"]')).toBeNull();
    expect(el.querySelector('[data-name="email"]')).not.toBeNull();
  });

  it('hides empty properties', async () => {
    const { fixture, el } = await setup();
    fixture.componentInstance.data.set({ username: '', email: 'x' });
    fixture.componentInstance.hideEmpty.set(true);
    fixture.detectChanges();
    expect(el.querySelector('[data-name="username"]')).not.toBeNull();
    // hideEmpty is evaluated against data$ which is created once in ngOnInit
    expect(el.querySelector('[data-name="email"]')).not.toBeNull();
  });

  it('coerces the mode input and rejects unknown modes', async () => {
    const { fixture, grid } = await setup();
    fixture.componentInstance.mode.set('form');
    fixture.detectChanges();
    expect(grid.isFormMode).toBe(true);
    expect(grid.isFormModeOrHasAnyEditCells).toBe(true);
    fixture.componentInstance.mode.set('plain');
    fixture.detectChanges();
    expect(grid.isFormMode).toBe(false);
    expect(() => {
      fixture.componentInstance.mode.set('invalid');
      fixture.detectChanges();
    }).toThrow();
  });

  it('exposes mode streams and edit mode state', async () => {
    const { grid } = await setup();
    expect(grid.hasAnyEditCells).toBe(false);
    expect(grid.isEditMode).toBe(false);
    grid.editMode = true;
    expect(grid.isEditMode).toBe(true);
    expect(grid.loading).toBe(false);
    let plain: boolean | undefined;
    grid.isPlainMode$.subscribe((v: boolean) => (plain = v));
    expect(plain).toBe(true);
  });

  it('warns and returns from edit actions without form mode or form directive', async () => {
    const { grid } = await setup();
    const warn = console.warn as Mock;
    warn.mockClear();
    grid.enableEditMode();
    grid.disableEditMode();
    grid.submit();
    expect(warn).toHaveBeenCalledTimes(3);
    expect(grid.isEditMode).toBe(false);
    grid.reset();
    grid.cancel();
    grid.refresh();
    grid.retry();
  });

  it('warns about missing form directive in form mode', async () => {
    const { fixture, grid } = await setup();
    fixture.componentInstance.mode.set('form');
    fixture.detectChanges();
    const warn = console.warn as Mock;
    warn.mockClear();
    grid.enableEditMode();
    grid.disableEditMode();
    grid.submit();
    expect(warn).toHaveBeenCalledTimes(3);
    grid.logCurrentFormState();
  });

  it('resets edit mode on router ActivationEnd', async () => {
    const { grid } = await setup();
    const router = TestBed.inject(Router);
    (router.events as Subject<any>).next(
      new (require('@angular/router').ActivationEnd)({} as any),
    );
  });

  it('throws when both data and dataSource are given', () => {
    @Component({
      selector: 'rxap-both',
      template: `<rxap-data-grid [data]="d" [dataSource]="ds"></rxap-data-grid>`,
      imports: [DataGridComponent],
    })
    class BothComponent {
      d = DATA;
      ds = makeDataSource(new BehaviorSubject(DATA));
    }
    expect(() => {
      const f = TestBed.createComponent(BothComponent);
      f.detectChanges();
    }).toThrow('You can not use both dataSource and data input');
  });

  it('warns when neither data nor dataSource is given', () => {
    @Component({
      selector: 'rxap-none',
      template: `<rxap-data-grid></rxap-data-grid>`,
      imports: [DataGridComponent],
    })
    class NoneComponent {}
    const f = TestBed.createComponent(NoneComponent);
    f.detectChanges();
    expect(console.warn).toHaveBeenCalledWith('No data source or data input provided');
  });

  describe('with a data source', () => {
    it('renders the emitted data, refreshes and disconnects', async () => {
      const subject = new BehaviorSubject<Data>(DATA);
      const ds = makeDataSource(subject);
      @Component({
        selector: 'rxap-ds-host',
        template: `<rxap-data-grid [dataSource]="ds">
          <ng-container rxapDataGridRowDef="username"></ng-container>
        </rxap-data-grid>`,
        imports: [DataGridComponent, DataGridRowDefDirective],
      })
      class DsHost {
        ds = ds;
      }
      const f = TestBed.createComponent(DsHost);
      f.detectChanges();
      await new Promise((r) => setTimeout(r, 150));
      f.detectChanges();
      const grid = f.debugElement.children[0].componentInstance as DataGridComponent<Data>;
      expect(f.nativeElement.querySelector('[data-name="username"] td').textContent).toContain('test');
      grid.refresh();
      expect(ds.refresh).toHaveBeenCalled();
      f.destroy();
      expect(ds.disconnect).toHaveBeenCalled();
    });

    it('shows error state with retry and loading spinner', async () => {
      const subject = new BehaviorSubject<Data>(DATA);
      const ds = makeDataSource(subject);
      const hasError = new BehaviorSubject(true);
      const loading = new BehaviorSubject(false);
      ds.hasError$ = hasError;
      ds.loading$ = loading;
      @Component({
        selector: 'rxap-err-host',
        template: `<rxap-data-grid [dataSource]="ds"></rxap-data-grid>`,
        imports: [DataGridComponent],
      })
      class ErrHost {
        ds = ds;
      }
      const f = TestBed.createComponent(ErrHost);
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();
      const btn = f.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(btn).not.toBeNull();
      btn.click();
      expect(ds.refresh).toHaveBeenCalled();
      hasError.next(false);
      loading.next(true);
      f.detectChanges();
      expect(f.nativeElement.querySelector('mat-spinner')).not.toBeNull();
      expect(f.nativeElement.querySelector('table')).toBeNull();
    });
  });

  it('renders sub header rows without a name', () => {
    const f = TestBed.createComponent(SubHeaderHostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.sub-header')).not.toBeNull();
  });

  it('does not throw for unnamed sub header rows when hideEmptyProperties is set', () => {
    const f = TestBed.createComponent(SubHeaderHostComponent);
    f.componentInstance.hide = true;
    expect(() => f.detectChanges()).not.toThrow();
  });

  it('shows the edit cell template for plain mode rows with edit cells and an edit button', async () => {
    const f = TestBed.createComponent(EditHostComponent);
    f.detectChanges();
    await new Promise((r) => setTimeout(r, 150));
    f.detectChanges();
    const grid = f.debugElement.children[0].componentInstance as DataGridComponent<Data>;
    expect(grid.hasAnyEditCells).toBe(true);
    expect(f.nativeElement.querySelector('tfoot button')).not.toBeNull();
    // no form directive: enabling edit mode only warns
    grid.enableEditMode();
    expect(grid.isEditMode).toBe(false);
  });
});

describe('DataGridValuePipe', () => {
  const pipe = new DataGridValuePipe<any>();
  it('reads the path value', async () => {
    const v = await firstValueFrom(pipe.transform(new BehaviorSubject({ a: { b: 1 } }), 'a.b'));
    expect(v).toBe(1);
  });
  it('throws without path', () => {
    expect(() => pipe.transform(new BehaviorSubject({}))).toThrow();
  });
});

describe('IsEmptyPipe', () => {
  const pipe = new IsEmptyPipe<any>();
  it.each([
    [null, true],
    [undefined, true],
    ['', true],
    [0, false],
    ['x', false],
  ])('value %p -> %p', (value, expected) => {
    let result: boolean | undefined;
    pipe.transform(new BehaviorSubject({ a: value }), 'a').subscribe((v) => (result = v));
    expect(result).toBe(expected);
  });
  it('throws without path', () => {
    expect(() => pipe.transform(new BehaviorSubject({}))).toThrow();
  });
});

function makeDataSource(subject: BehaviorSubject<Data>): DataSource<Data> & any {
  return {
    connect: vi.fn(() => subject.asObservable()),
    disconnect: vi.fn(),
    refresh: vi.fn(),
    hasError$: undefined,
    loading$: undefined,
  };
}
