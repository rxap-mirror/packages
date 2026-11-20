import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Directive, ElementRef, INJECTOR, Injector, OnDestroy, OnInit, Renderer2, ViewContainerRef, input, inject } from '@angular/core';
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
  private readonly selectRowService = inject<SelectRowService<Data> | null>(SelectRowService, { optional: true });


  public override readonly isHeader = true;

  private _subscription?: Subscription;

  constructor() {
    const renderer = inject<Renderer2>(Renderer2);
    const overlay = inject<Overlay>(Overlay);
    const elementRef = inject<ElementRef>(ElementRef);
    const actionMethod = inject<TableRowActionMethod<Data>>(RXAP_TABLE_ROW_ACTION_METHOD);
    const cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    const vcr = inject<ViewContainerRef>(ViewContainerRef);
    const tableDataSourceDirective = inject<TableDataSourceDirective>(TableDataSourceDirective);
    const snackBar = inject<MatSnackBar>(MatSnackBar);
    const matButton = inject<MatButton | null>(MatButton, { optional: true });
    const matTooltip = inject<MatTooltip | null>(MatTooltip, { optional: true });
    const injector = inject<Injector>(INJECTOR);

    super(
      renderer,
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

  public override readonly type = input.required<string>({ alias: "rxapTableRowHeaderAction" });
}
