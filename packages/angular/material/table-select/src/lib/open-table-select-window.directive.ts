import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Injector,
  Input,
  isDevMode,
  OnChanges,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BaseDataSource } from '@rxap/data-source';
import { AbstractTableDataSource } from '@rxap/data-source/table';
import { GenerateRandomString } from '@rxap/utilities';
import { Observable } from 'rxjs';
import {
  OpenTableSelectWindowMethod,
  TableSelectColumn,
} from './open-table-select-window.method';

@Directive({
  selector: '[rxapOpenTableSelectWindow]',
  standalone: true,
})
export class OpenTableSelectWindowDirective<Data extends Record<string, any> = Record<string, any>>
  implements OnChanges, OnInit {
  @Input()
  public data?: Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data>;
  @Input()
  public columns?: Map<string, TableSelectColumn> | Record<string, TableSelectColumn>;
  @Input()
  public selected: Data[] = [];
  @Input()
  public parameters?: Observable<Record<string, unknown>>;
  @Output()
  public selectedChange = new EventEmitter<Data[]>();
  @Input()
  public label?: string;
  @Input()
  public id?: string;
  @Input()
  public compareWith?: (o1: Data, o2: Data) => boolean;
  @HostBinding('type')
  public type = 'button';
  protected _hasOpenWindow = false;
  private invalidInputs = false;

  constructor(
    private readonly openMethod: OpenTableSelectWindowMethod<Data>,
    private readonly injector: Injector,
    @Optional()
    @Inject(MatButton)
    private readonly matButton: MatButton | null,
  ) {
  }

  private _disabled = false;

  get disabled(): boolean {
    return this._disabled || this.invalidInputs;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  public ngOnChanges() {
    this.checkInputs();
  }

  public ngOnInit() {
    this.checkInputs();
  }

  @HostListener('click', [ '$event' ])
  public async onClick($event: Event) {
    if (this.disabled || this._hasOpenWindow) {
      return;
    }
    $event.stopPropagation();
    if (!this.data || !this.columns) {
      throw new Error('FATAL: The data or columns input is not set');
    }
    const selected = await this.openMethod.call({
      injector: this.injector,
      data: this.data,
      columns: this.columns instanceof Map ? this.columns : new Map(Object.entries(this.columns)),
      selected: this.selected?.slice() ?? [],
      title: this.label ?? 'Select value',
      compareWith: this.compareWith,
      id: this.id ?? GenerateRandomString(10),
      parameters: this.parameters,
    });
    if (isDevMode()) {
      console.debug('selected', selected);
    }
    this.selected = selected ?? [];
    this._hasOpenWindow = false;
    this.selectedChange.emit(selected);
  }

  public checkInputs() {
    if (!this.columns || !this.data) {
      console.warn('columns or data is not defined');
      this.invalidInputs = true;
      if (this.matButton) {
        this.matButton.disabled = this.disabled;
      }
    } else {
      if (typeof this.columns !== 'object') {
        throw new Error('Ensure that the input columns has a valid value');
      }
      if (!Array.isArray(this.data) && !(this.data instanceof BaseDataSource)) {
        throw new Error('Ensure that the input data has a valid value');
      }
      this.invalidInputs = false;
      if (this.matButton) {
        this.matButton.disabled = this.disabled;
      }
    }
  }

}
