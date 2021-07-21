import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewContainerRef
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  map,
  startWith,
  tap
} from 'rxjs/operators';
import { TableRowActionDirective } from './table-row-action.directive';
import { TableRowActionMethod } from './table-row-action.method';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { SelectRowService } from '../select-row/select-row.service';

@Directive({
  selector: 'button[rxapTableRowHeaderAction]'
})
export class TableRowHeaderActionDirective<Data extends Record<string, any>>
  extends TableRowActionDirective<Data>
  implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  constructor(
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
    @Inject(SelectRowService)
    private readonly selectRowService: SelectRowService<Data> | null
  ) {
    super(
      actionMethod,
      cdr,
      vcr,
      tableDataSourceDirective,
      snackBar,
      matButton
    );
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
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
                                 })
                               )
                               .subscribe();
    } else {
      this.setButtonDisabled();
    }
  }

  protected getElementList(): Data[] {
    return this.selectRowService?.selectedRows ?? [];
  }

  @Input('rxapTableRowHeaderAction')
  @Required
  public type!: string;
}
