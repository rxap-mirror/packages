import {
  ChangeDetectorRef,
  ContentChild,
  Directive,
  HostListener,
  Inject,
  Input,
  isDevMode,
  Optional,
  ViewContainerRef
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  coerceBoolean,
  Required
} from '@rxap/utilities';
import { TableRowActionMethod } from './table-row-action.method';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import { TableRowActionStatus } from './table-row-action-status';
import { TableDataSourceDirective } from '../table-data-source.directive';

@Directive({
  selector: 'button[rxapTableRowAction]'
})
export class TableRowActionDirective<Data extends Record<string, any>> {
  private _hasConfirmDirective = false;

  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  @Input()
  @Required
  public element!: Data;
  @Input('rxapTableRowAction')
  @Required
  public type!: string;
  @ContentChild(TableRowActionExecutingDirective)
  private readonly executingDirective?: TableRowActionExecutingDirective;
  private _currentStatus: TableRowActionStatus = TableRowActionStatus.DONE;

  constructor(
    @Inject(RXAP_TABLE_ROW_ACTION_METHOD)
    private readonly actionMethod: TableRowActionMethod<Data>,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Inject(ViewContainerRef)
    private readonly vcr: ViewContainerRef,
    @Inject(TableDataSourceDirective)
    private readonly tableDataSourceDirective: TableDataSourceDirective,
    @Optional()
    @Inject(MatButton)
    private readonly matButton: MatButton | null
  ) {}

  @HostListener('confirmed')
  public onConfirmed() {
    return this.execute();
  }

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
    if (!this._hasConfirmDirective) {
      return this.execute();
    } else {
      if (isDevMode()) {
        console.debug('skip remote method call. Wait for confirmation.');
      }
    }
    return Promise.resolve();
  }

  public async execute(): Promise<void> {
    this.setStatus(TableRowActionStatus.EXECUTING);
    await Promise.all(
      this.getElementList().map((element) =>
        this.actionMethod.call({ element, type: this.type })
      )
    );
    this.setStatus(TableRowActionStatus.DONE);
  }

  protected getElementList(): Data[] {
    return [ this.element ];
  }

  protected setButtonDisabled() {
    if (this.matButton) {
      this.matButton.disabled = true;
    }
  }

  protected setButtonEnabled() {
    if (this.matButton) {
      this.matButton.disabled = false;
    }
  }

  private setStatus(status: TableRowActionStatus) {
    if (this._currentStatus === status) {
      return;
    }
    this._currentStatus = status;
    switch (status) {
      case TableRowActionStatus.EXECUTING:
        this.setButtonDisabled();
        this.executingDirective?.show();
        break;
      case TableRowActionStatus.DONE:
        this.setButtonEnabled();
        this.executingDirective?.hide();
        this.tableDataSourceDirective.refresh();
        break;
    }
    this.cdr.detectChanges();
  }
}
