import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, isDevMode, OnDestroy, OnInit, input, output, contentChildren, inject, linkedSignal, signal } from '@angular/core';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ActivationEnd,
  Router,
} from '@angular/router';
import { FormDirective, FormSubmitFailedDirective, FormSubmitSuccessfulDirective, FormSubmitInvalidDirective } from '@rxap/forms';
import {
  DataSource,
  DataSourceViewer,
} from '@rxap/pattern';
import {
  EscapeQuotationMarkPipe,
  GetFromObjectPipe,
  ReplacePipe,
} from '@rxap/pipes';
import { ToggleSubject } from '@rxap/rxjs';
import { clone, coerceBoolean } from '@rxap/utilities';
import {
  combineLatest,
  debounceTime,
  EMPTY,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  take,
  tap,
} from 'rxjs/operators';
import { DataGridRowDefDirective } from './data-grid-row-def.directive';
import { DataGridValuePipe } from './data-grid-value.pipe';
import { IsEmptyPipe } from './is-empty.pipe';
import { Showcase } from '@ng-prism/core';

export enum DataGridMode {
  /**
   * The view cell template is used to display the property value
   */
  PLAIN = 'plain',
  /**
   * The edit cell template is used to display the property value, but the form and all controls are marked as disabled
   */
  FORM  = 'form',
}

function IsDataGridMode(value: string): value is DataGridMode {
  return [ DataGridMode.PLAIN, DataGridMode.FORM ].includes(value as any);
}

function coerceDataGridMode(value: DataGridMode | string): DataGridMode {
  if (IsDataGridMode(value)) {
    return value;
  }
  throw new Error(`The data grid mode only support 'plain' and 'form' - given '${ value }'`);
}

@Showcase<DataGridComponent<any>>({
  title: 'Data Grid',
  category: 'Data Grid',
  description: 'Shows the properties of a data object as label and value rows. The rows are defined with `rxapDataGridRowDef` and can be customized with header, view and edit cell templates.',
  status: 'stable',
  variants: [
    {
      name: 'Default',
      inputs: { data: { username: 'jdoe', email: 'jane.doe@example.com', role: 'Administrator' } },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="email"></ng-container><ng-container rxapDataGridRowDef="role"></ng-container>',
    },
    {
      name: 'With header',
      inputs: { data: { username: 'jdoe', email: 'jane.doe@example.com', role: 'Administrator' }, header: true },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="email"></ng-container><ng-container rxapDataGridRowDef="role"></ng-container>',
    },
    {
      name: 'Nested property',
      description: 'The row name is the path of a nested property.',
      inputs: { data: { username: 'jdoe', address: { city: 'Berlin', zip: '10115' } } },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="address.city"></ng-container><ng-container rxapDataGridRowDef="address.zip"></ng-container>',
    },
    {
      name: 'Flipped rows',
      description: 'The header is shown above the value.',
      inputs: { data: { username: 'jdoe', description: 'Maintains the user administration of the platform.' } },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="description" [flip]="true"></ng-container>',
    },
    {
      name: 'Display properties',
      description: 'Only the listed properties are shown.',
      inputs: { data: { username: 'jdoe', email: 'jane.doe@example.com', role: 'Administrator' }, displayProperties: ['username', 'role'] },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="email"></ng-container><ng-container rxapDataGridRowDef="role"></ng-container>',
    },
    {
      name: 'Hide empty properties',
      inputs: { data: { username: 'jdoe', phone: null, role: 'Administrator' }, hideEmptyProperties: true },
      template: '<ng-container rxapDataGridRowDef="username"></ng-container><ng-container rxapDataGridRowDef="phone"></ng-container><ng-container rxapDataGridRowDef="role"></ng-container>',
    },
    {
      name: 'Custom cells',
      description: 'The header cell and the view cell of a row are replaced with templates.',
      inputs: { data: { username: 'jdoe', email: 'jane.doe@example.com' } },
      template: `
        <ng-container rxapDataGridRowDef="username"></ng-container>
        <ng-container rxapDataGridRowDef="email">
          <th *rxapDataGridHeaderCellDef="let name" class="py-2 whitespace-nowrap">Contact ({{ name }})</th>
          <ng-template rxapDataGridCellDef let-value>
            <strong>{{ value }}</strong>
          </ng-template>
        </ng-container>
      `,
    },
    {
      name: 'Sub header',
      description: 'A row without a name is a sub header with a custom header cell.',
      inputs: { data: { username: 'jdoe', email: 'jane.doe@example.com' } },
      template: `
        <ng-container rxapDataGridRowDef="username"></ng-container>
        <ng-container rxapDataGridRowDef>
          <th *rxapDataGridHeaderCellDef colspan="2">Contact</th>
        </ng-container>
        <ng-container rxapDataGridRowDef="email"></ng-container>
      `,
    },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rxap-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    GetFromObjectPipe,
    ReplacePipe,
    EscapeQuotationMarkPipe,
    FormSubmitFailedDirective, FormSubmitSuccessfulDirective, FormSubmitInvalidDirective,
    DataGridValuePipe,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgTemplateOutlet,
    MatFormFieldModule,
    NgClass,
    IsEmptyPipe
]
})
export class DataGridComponent<T extends Record<string, any>> implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly formDirective = inject(FormDirective, { optional: true });


  public isDevMode = isDevMode();

  public readonly header = input(false, { transform: coerceBoolean });

  public readonly dataSource = input<DataSource<T>>();

  public data$!: Observable<T>;

  public readonly viewer = input<DataSourceViewer>(this);

  public readonly data = input<T>();

  /**
   * The current data. Initialized from the data input and updated with the values emitted by the data source
   */
  protected readonly currentData = linkedSignal(() => this.data());

  public readonly displayProperties = input<string[] | null>(null);

  public readonly hideEmptyProperties = input(false, { transform: coerceBoolean });

  public readonly rows = contentChildren(DataGridRowDefDirective);
  public readonly editModeChange = output<{
    mode: boolean;
    data?: T;
    done: () => void;
}>();
  public readonly rows$ = toObservable(this.rows);
  public hasError$: Observable<boolean>                           = of(false);
  public dataLoading$: Observable<boolean>                        = of(false);
  public loading$                                                 = new ToggleSubject();
  public readonly mode = input<DataGridMode, DataGridMode | string>(DataGridMode.PLAIN, { transform: coerceDataGridMode });
  private readonly _editMode                                      = signal(false);
  public readonly isEditMode$: Observable<boolean>                = toObservable(this._editMode);
  public readonly mode$: Observable<DataGridMode>                 = toObservable(this.mode);
  public readonly isFormMode$: Observable<boolean>                = this.mode$.pipe(map(mode => mode === DataGridMode.FORM));
  public readonly isPlainMode$: Observable<boolean>               = this.mode$.pipe(map(mode => mode === DataGridMode.PLAIN));
  private _routerEventSubscription: Subscription | null           = null;

  public get isFormModeOrHasAnyEditCells() {
    return this.mode() === DataGridMode.FORM || this.hasAnyEditCells;
  }

  public get isFormMode() {
    return this.mode() === DataGridMode.FORM;
  }

  public get hasAnyEditCells() {
    return this.rows()?.some(row => !!row.editCell()) ?? false;
  }

  public get isEditMode() {
    return this._editMode();
  }

  public set editMode(value: boolean) {
    this._editMode.set(value);
  }

  /**
   * @deprecated use the loading$ property instead
   */
  public get loading() {
    return this.loading$.value;
  }

  public logCurrentFormState() {
    console.log(clone(this.formDirective?.form.value));
  }

  public ngOnInit() {
    // resets the edit mode if this component is used in a sibling router path
    // if not reset the edit mode is president after the route changes
    this._routerEventSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      tap(() => this.disableEditMode()),
    ).subscribe();

    const dataSource = this.dataSource();
    const dataValue = this.currentData();
    if (dataSource && dataValue) {
      throw new Error('You can not use both dataSource and data input');
    }

    let data$: Observable<T> = EMPTY;

    if (dataSource) {
      data$ = dataSource.connect(this.viewer());
    }

    if (dataValue) {
      data$ = of(dataValue);
    }

    if (data$ === EMPTY && isDevMode()) {
      console.warn('No data source or data input provided');
    }

    this.data$ = data$.pipe(
      debounceTime(100),
      tap(data => this.currentData.set(data)),
      tap(data => {
        if (this.formDirective && this.isFormMode) {
          this.formDirective.form.patchValue(data, {
            coerce: true,
            strict: true,
          });
          if (this.isFormMode) {
            this.formDirective.form.disable();
          }
        }
      }),
      shareReplay(1),
    );
    if (dataSource) {
      this.hasError$    = dataSource.hasError$ ?? this.hasError$;
      this.dataLoading$ = dataSource.loading$ ?? this.dataLoading$;
    }
    if (this.formDirective && this.isFormMode) {
      this.formDirective.form.disabledWhile(combineLatest([
        this.isEditMode$,
        this.mode$,
      ]).pipe(
        map(([ editMode, mode ]) => !editMode && mode === 'form'),
      ), {onlySelf: false});
    }
  }

  public ngOnDestroy() {
    this.dataSource()?.disconnect(this.viewer());
    this._routerEventSubscription?.unsubscribe();
  }

  public enableEditMode(skipPatchValue = false) {
    if (!this.isFormModeOrHasAnyEditCells) {
      if (isDevMode()) {
        console.warn('Can not enable edit mode if the mode is not form');
      }
      return;
    }
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not enable edit mode without a form directive');
      }
      return;
    }
    this.editMode = true;
    const data = this.currentData();
    if (!skipPatchValue && data) {
      this.formDirective.form.patchValue(data, {
        coerce: true,
        strict: true,
      });
    }
  }

  public disableEditMode() {
    if (!this.isFormModeOrHasAnyEditCells) {
      if (isDevMode()) {
        console.warn('Can not disable edit mode if the mode is not form');
      }
      return;
    }
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not enable edit mode without a form directive');
      }
      return;
    }
    this.editMode = false;
  }

  public submit() {
    if (!this.isFormModeOrHasAnyEditCells) {
      if (isDevMode()) {
        console.warn('Can not submit if the mode is not form');
      }
      return;
    }
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not support without a form directive');
      }
      return;
    }
    this.loading$.enable();
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    outputToObservable(this.formDirective.rxapSubmit).pipe(
      take(1),
      tap(() => {
        this.disableEditMode();
      }),
    ).subscribe();
    outputToObservable(this.formDirective.invalidSubmit).pipe(
      take(1),
      tap(() => {
        this.loading$.disable();
      }),
    ).subscribe();
    this.formDirective.submitError$.pipe(
      filter(Boolean), // if the error is undefined we do not want to disable the loading
      take(1),
      tap(() => {
        this.loading$.disable();
        this.enableEditMode(true);
      }),
    ).subscribe();
    outputToObservable(this.formDirective.submitSuccessful$).pipe(
      take(1),
      tap(() => {
        this.loading$.disable();
        this.refresh();
      }),
    ).subscribe();
    this.formDirective.onSubmit(new Event('submit'));
  }

  public reset() {
    const data = this.currentData();
    if (this.formDirective && data && this.isFormModeOrHasAnyEditCells) {
      this.formDirective.form.patchValue(data, {
        coerce: true,
        strict: true,
      });
    }
  }

  public refresh() {
    const dataSource = this.dataSource();
    if (dataSource) {
      dataSource.refresh();
    } else if (isDevMode()) {
      console.warn('can not refresh the data. data source is not defined');
    }
  }

  public cancel() {
    this.reset();
    this.disableEditMode();
  }

  retry() {
    this.refresh();
  }
}
