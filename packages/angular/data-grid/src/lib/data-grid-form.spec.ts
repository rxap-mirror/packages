import { Component, INJECTOR, Injector, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivationEnd, provideRouter, Router } from '@angular/router';
import {
  FormDirective,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridRowDefDirective } from './data-grid-row-def.directive';
import { DataGridComponent } from './data-grid.component';

interface Data {
  username: string;
  email: string;
}

@RxapForm('data-grid-test')
class DataGridTestForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ validators: [Validators.required] })
  public username!: RxapFormControl<string>;

  @UseFormControl()
  public email!: RxapFormControl<string>;
}

@Component({
  selector: 'rxap-test-form-host',
  imports: [
    ReactiveFormsModule,
    FormDirective,
    DataGridComponent,
    DataGridRowDefDirective,
    DataGridCellDefDirective,
    DataGridEditCellDefDirective,
  ],
  providers: [
    DataGridTestForm,
    {
      provide: RXAP_FORM_DEFINITION_BUILDER,
      useFactory: (injector: Injector) => new RxapFormBuilder<any>(DataGridTestForm as any, injector),
      deps: [INJECTOR],
    },
    {
      provide: RXAP_FORM_DEFINITION,
      useFactory: (builder: RxapFormBuilder) => builder.build(),
      deps: [RXAP_FORM_DEFINITION_BUILDER],
    },
  ],
  template: `
    <form rxapForm [submitMethod]="submitMethod">
      <rxap-data-grid [data]="data" [dataSource]="dataSource" [mode]="mode">
        <ng-container rxapDataGridRowDef="username">
          <ng-template rxapDataGridEditCellDef>
            <input class="edit-username" formControlName="username" />
          </ng-template>
        </ng-container>
        <ng-container rxapDataGridRowDef="email">
          <ng-template rxapDataGridCellDef let-value>view:{{ value }}</ng-template>
        </ng-container>
      </rxap-data-grid>
    </form>
  `,
})
class FormHostComponent {
  readonly formDirective = viewChild.required(FormDirective);
  readonly grid = viewChild.required(DataGridComponent);
  data: Data | undefined = { username: 'test', email: 'a@b.de' };
  dataSource: any = undefined;
  mode = 'plain';
  submitMethod: any = { call: vi.fn(async (value: Data) => value) };
}

function makeDataSource(subject: BehaviorSubject<Data>) {
  return {
    connect: vi.fn(() => subject.asObservable()),
    disconnect: vi.fn(),
    refresh: vi.fn(),
    hasError$: undefined,
    loading$: undefined,
  };
}

describe('DataGridComponent inside a form', () => {
  beforeEach(() => {
    for (const method of ['warn', 'log', 'debug', 'error', 'group', 'groupEnd'] as const) {
      vi.spyOn(console, method).mockImplementation(() => undefined);
    }
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [NoopAnimationsModule],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function setup(configure?: (host: FormHostComponent) => void): Promise<{
    fixture: ComponentFixture<FormHostComponent>;
    el: HTMLElement;
    host: FormHostComponent;
    grid: DataGridComponent<Data>;
    form: RxapFormGroup;
  }> {
    const fixture = TestBed.createComponent(FormHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();
    const host = fixture.componentInstance;
    return {
      fixture,
      el: fixture.nativeElement as HTMLElement,
      host,
      grid: host.grid() as DataGridComponent<Data>,
      form: host.formDirective().form,
    };
  }

  it('patches the data into the form and disables it in the form mode', async () => {
    const { grid, form, fixture, el } = await setup(host => (host.mode = 'form'));
    expect(grid.isFormMode).toBe(true);
    expect(form.value).toEqual({ username: 'test', email: 'a@b.de' });
    expect(form.disabled).toBe(true);
    // the edit template is used in the form mode and the form is not editable
    expect(el.querySelector('input.edit-username')).not.toBeNull();

    grid.enableEditMode();
    fixture.detectChanges();
    await vi.waitFor(() => expect(form.enabled).toBe(true));

    grid.disableEditMode();
    await vi.waitFor(() => expect(form.disabled).toBe(true));
  });

  it('does not touch the form value in the plain mode before the edit mode is enabled', async () => {
    const { grid, form, el } = await setup();
    expect(grid.isFormMode).toBe(false);
    expect(grid.hasAnyEditCells).toBe(true);
    expect(form.value).toEqual({ username: null, email: null });
    expect(el.querySelector('input.edit-username')).toBeNull();
    expect(el.querySelector('[data-name="email"] td')?.textContent).toContain('view:a@b.de');
  });

  it('enables the edit mode, patches the form and shows the edit template and the action buttons', async () => {
    const { grid, form, fixture, el } = await setup();
    expect(el.querySelector('tfoot button')?.textContent).toContain('Edit');

    el.querySelector<HTMLButtonElement>('tfoot button')!.click();
    fixture.detectChanges();

    expect(grid.isEditMode).toBe(true);
    expect(form.value).toEqual({ username: 'test', email: 'a@b.de' });
    expect(el.querySelector('input.edit-username')).not.toBeNull();
    const labels = Array.from(el.querySelectorAll('tfoot button')).map(b => b.textContent?.trim());
    expect(labels).toEqual(['Save', 'Reset', 'Cancel', 'Current Form State']);
  });

  it('can enable the edit mode without patching the form value', async () => {
    const { grid, form } = await setup();
    grid.enableEditMode(true);
    expect(grid.isEditMode).toBe(true);
    expect(form.value).toEqual({ username: null, email: null });
  });

  it('logs the current form state', async () => {
    const { grid } = await setup();
    grid.enableEditMode();
    grid.logCurrentFormState();
    expect(console.log).toHaveBeenCalledWith({ username: 'test', email: 'a@b.de' });
  });

  it('reset restores the data in the form', async () => {
    const { grid, form } = await setup();
    grid.enableEditMode();
    form.patchValue({ username: 'changed' });
    expect(form.value.username).toBe('changed');
    grid.reset();
    expect(form.value).toEqual({ username: 'test', email: 'a@b.de' });
  });

  it('cancel resets the form and leaves the edit mode', async () => {
    const { grid, form, fixture, el } = await setup();
    grid.enableEditMode();
    form.patchValue({ username: 'changed' });
    fixture.detectChanges();

    el.querySelectorAll<HTMLButtonElement>('tfoot button')[2].click();
    fixture.detectChanges();

    expect(grid.isEditMode).toBe(false);
    expect(form.value.username).toBe('test');
  });

  it('leaves the edit mode when a route is activated', async () => {
    const { grid } = await setup();
    grid.enableEditMode();
    expect(grid.isEditMode).toBe(true);
    (TestBed.inject(Router).events as Subject<any>).next(new ActivationEnd({} as any));
    expect(grid.isEditMode).toBe(false);
  });

  describe('submit', () => {
    it('submits the form, leaves the edit mode and refreshes the data source on success', async () => {
      const subject = new BehaviorSubject<Data>({ username: 'test', email: 'a@b.de' });
      const dataSource = makeDataSource(subject);
      const { grid, form, host } = await setup(h => {
        h.data = undefined;
        h.dataSource = dataSource;
      });
      grid.enableEditMode();
      form.patchValue({ username: 'new-name' });

      grid.submit();
      expect(grid.loading$.value).toBe(true);

      await vi.waitFor(() => expect(dataSource.refresh).toHaveBeenCalledTimes(1));
      expect(host.submitMethod.call).toHaveBeenCalledWith(
        { username: 'new-name', email: 'a@b.de' },
        null,
        null,
      );
      expect(grid.isEditMode).toBe(false);
      expect(grid.loading$.value).toBe(false);
    });

    it('warns instead of refreshing when the grid has no data source', async () => {
      const { grid } = await setup();
      grid.enableEditMode();
      grid.submit();
      await vi.waitFor(() => expect(console.warn).toHaveBeenCalledWith('can not refresh the data. data source is not defined'));
      expect(grid.isEditMode).toBe(false);
    });

    it('stays in the edit mode and stops loading when the form is invalid', async () => {
      const { grid, form, host } = await setup(h => (h.data = { username: '', email: 'x' }));
      grid.enableEditMode();
      expect(form.valid).toBe(false);

      grid.submit();

      expect(host.submitMethod.call).not.toHaveBeenCalled();
      expect(grid.loading$.value).toBe(false);
      expect(grid.isEditMode).toBe(true);
      expect(form.controls['username'].dirty).toBe(true);
      expect(form.controls['username'].touched).toBe(true);
    });

    it('stays in the edit mode, keeps the user input and stops loading when the submit fails', async () => {
      const { grid, form, host } = await setup(h => {
        h.submitMethod = { call: vi.fn(async () => Promise.reject(new Error('rejected'))) };
      });
      grid.enableEditMode();
      form.patchValue({ username: 'changed' });

      grid.submit();

      await vi.waitFor(() => expect(host.formDirective().submitError$.value).toEqual(new Error('rejected')));
      await vi.waitFor(() => expect(grid.loading$.value).toBe(false));
      expect(grid.isEditMode).toBe(true);
      expect(form.value.username).toBe('changed');
    });
  });
});

describe('data grid cell and row directives', () => {
  it('ngTemplateContextGuard of the cell def directives accepts every context', () => {
    expect(DataGridCellDefDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
    expect(DataGridEditCellDefDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
    expect(DataGridHeaderCellDefDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
  });
});
