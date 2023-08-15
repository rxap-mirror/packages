import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  INJECTOR,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import {
  map,
  startWith,
  tap,
} from 'rxjs/operators';
import { SelectRowService } from '../select-row/select-row.service';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { AbstractTableRowAction } from './abstract-table-row-action';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
import { TableRowActionMethod } from './types';

@Directive({
  selector: 'button[rxapTableRowHeaderAction]',
  standalone: true,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [ 'errorMessage', 'successMessage', 'refresh', 'color' ],
})
export class TableRowHeaderActionDirective<Data extends Record<string, any>>
  extends AbstractTableRowAction<Data>
  implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  constructor(
    @Inject(Overlay)
      overlay: Overlay,
    @Inject(ElementRef)
      elementRef: ElementRef,
    @Inject(RXAP_TABLE_ROW_ACTION_METHOD)
      actionMethod: TableRowActionMethod<Data>,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(ViewContainerRef)
      vcr: ViewContainerRef,
    @Inject(TableDataSourceDirective)
      tableDataSourceDirective: TableDataSourceDirective,
    @Inject(MatSnackBar)
      snackBar: MatSnackBar,
    @Optional()
    @Inject(MatButton)
      matButton: MatButton | null,
    @Optional()
    @Inject(MatTooltip)
      matTooltip: MatTooltip | null,
    @Inject(INJECTOR)
      injector: Injector,
    @Optional()
    @Inject(SelectRowService)
    private readonly selectRowService: SelectRowService<Data> | null,
  ) {
    super(
      overlay,
      elementRef,
      actionMethod,
      cdr,
      vcr,
      tableDataSourceDirective,
      snackBar,
      matButton,
      matTooltip,
      injector,
    );
  }

  public override ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public override ngOnInit() {
    if (this.selectRowService) {
      this._subscription = this.selectRowService.selectedRows$
                               .pipe(
                                 startWith(this.selectRowService.selectedRows),
                                 map((rows) => rows.length !== 0),
                                 tap((hasSelected) => {
                                   if (hasSelected) {
                                     this.setButtonEnabled();
                                   } else {
                                     this.setButtonDisabled();
                                   }
                                   this.cdr.detectChanges();
                                 }),
                               )
                               .subscribe();
    } else {
      this.setButtonDisabled();
    }
  }

  protected override getElementList(): Data[] {
    return this.selectRowService?.selectedRows ?? [];
  }

  @Input({
    required: true,
    alias: 'rxapTableRowHeaderAction',
  })
  public override type!: string;
}
