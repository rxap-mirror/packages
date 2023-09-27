import {
  AsyncPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ActivationEnd,
  Router,
} from '@angular/router';
import {
  FormDirective,
  RxapFormsModule,
} from '@rxap/forms';
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
import { clone } from '@rxap/utilities';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  EMPTY,
  merge,
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

export enum DataGridMode {
  /**
   * The view cell template is used to display the property value
   */
  PLAIN = 'plain',
  /**
   * The edit cell template is used to display the property value, but the form and all controls are marked as disabled
   */
  FORM = 'form',
}

function IsDataGridMode(value: string): value is DataGridMode {
  return [ DataGridMode.PLAIN, DataGridMode.FORM ].includes(value as any);
}

@Component({
  selector: 'rxap-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: [ './data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    MatButtonModule,
    MatIconModule,
    GetFromObjectPipe,
    ReplacePipe,
    EscapeQuotationMarkPipe,
    RxapFormsModule,
    DataGridValuePipe,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgTemplateOutlet,
    MatFormFieldModule,
    NgClass,
  ],
})
export class DataGridComponent<T extends Record<string, any>> implements OnInit, OnDestroy, AfterContentInit {

  public isDevMode = isDevMode();

  @Input()
  public header = false;

  @Input()
  public dataSource?: DataSource<T>;

  public data$!: Observable<T>;

  @Input()
  public viewer: DataSourceViewer = this;

  @Input()
  public data?: T;

  @Input()
  public displayProperties: string[] | null = null;

  @ContentChildren(DataGridRowDefDirective)
  public rows!: QueryList<DataGridRowDefDirective<T>>;
  @Output()
  public editModeChange = new EventEmitter<{ mode: boolean, data?: T, done: () => void }>();
  public rows$: Observable<QueryList<DataGridRowDefDirective<T>>> = EMPTY;
  public hasError$: Observable<boolean> = of(false);
  public dataLoading$: Observable<boolean> = of(false);
  public loading$ = new ToggleSubject();
  public readonly isEditMode$: Observable<boolean>;
  public readonly mode$: Observable<DataGridMode>;
  public readonly isFormMode$: Observable<boolean>;
  public readonly isPlainMode$: Observable<boolean>;
  private _editMode$ = new BehaviorSubject<boolean>(false);
  private _mode$ = new BehaviorSubject<DataGridMode>(DataGridMode.PLAIN);
  private _routerEventSubscription: Subscription | null = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    @Optional()
    private readonly formDirective?: FormDirective,
  ) {
    this.isEditMode$ = this._editMode$.asObservable();
    this.mode$ = this._mode$.asObservable();
    this.isFormMode$ = this.mode$.pipe(map(mode => mode === DataGridMode.FORM));
    this.isPlainMode$ = this.mode$.pipe(map(mode => mode === DataGridMode.PLAIN));
  }

  @Input()
  public set mode(value: DataGridMode | string) {
    if (IsDataGridMode(value)) {
      this._mode$.next(value);
    } else {
      throw new Error(`The data grid mode only support 'plain' and 'form' - given '${ value }'`);
    }
  }

  public get isFormMode() {
    return this._mode$.value === DataGridMode.FORM;
  }

  public get hasAnyEditCells() {
    return this.rows.some(row => !!row.editCell);
  }

  public get isEditMode() {
    return this._editMode$.value;
  }

  public set editMode(value: boolean) {
    this._editMode$.next(value);
  }

  /**
   * @deprecated use the loading$ property instead
   */
  public get loading() {
    return this.loading$.value;
  }

  public ngAfterContentInit() {
    this.rows$ = merge(
      of(this.rows),
      this.rows.changes,
    );
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

    if (this.dataSource && this.data) {
      throw new Error('You can not use both dataSource and data input');
    }

    let data$: Observable<T> = EMPTY;

    if (this.dataSource) {
      data$ = this.dataSource.connect(this.viewer);
    }

    if (this.data) {
      data$ = of(this.data);
    }

    if (data$ === EMPTY && isDevMode()) {
      console.warn('No data source or data input provided');
    }

    this.data$ = data$.pipe(
      debounceTime(100),
      tap(data => this.data = data),
      tap(data => {
        if (this.formDirective) {
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
    if (this.dataSource) {
      this.hasError$ = this.dataSource.hasError$ ?? this.hasError$;
      this.dataLoading$ = this.dataSource.loading$ ?? this.dataLoading$;
    }
    if (this.formDirective && this.isFormMode) {
      this.formDirective.form.disabledWhile(combineLatest([
        this._editMode$,
        this._mode$,
      ]).pipe(
        map(([ editMode, mode ]) => !editMode && mode === 'form'),
      ), { onlySelf: false });
    }
  }

  public ngOnDestroy() {
    this.dataSource?.disconnect(this.viewer);
    this._routerEventSubscription?.unsubscribe();
  }

  public enableEditMode() {
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not enable edit mode without a form directive');
      }
      return;
    }
    this.editMode = true;
    if (this.data) {
      this.formDirective.form.patchValue(this.data, {
        coerce: true,
        strict: true,
      });
    }
  }

  public disableEditMode() {
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not enable edit mode without a form directive');
      }
      return;
    }
    this.editMode = false;
  }

  public submit() {
    if (!this.formDirective) {
      if (isDevMode()) {
        console.warn('Can not support without a form directive');
      }
      return;
    }
    this.loading$.enable();
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    this.formDirective.cdr.markForCheck();
    this.formDirective.rxapSubmit.pipe(
      take(1),
      tap(() => {
        this.disableEditMode();
      }),
    ).subscribe();
    this.formDirective.invalidSubmit.pipe(
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
      }),
    ).subscribe();
    this.formDirective.submitSuccessful$.pipe(
      take(1),
      tap(() => {
        this.loading$.disable();
        this.refresh();
      }),
    ).subscribe();
    this.formDirective.onSubmit(new Event('submit'));
  }

  public reset() {
    if (this.formDirective && this.data) {
      this.formDirective.form.patchValue(this.data, {
        coerce: true,
        strict: true,
      });
    }
  }

  public refresh() {
    if (this.dataSource) {
      this.dataSource.refresh();
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
