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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  coerceArray,
  coerceBoolean,
  Required
} from '@rxap/utilities';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import { TableRowActionStatus } from './table-row-action-status';
import {
  IsTableRowActionTypeMethod,
  IsTableRowActionTypeSwitchMethod,
  TableRowActionMethod,
  TableRowActionTypeMethod,
  TableRowActionTypeSwitchMethod
} from './table-row-action.method';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
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

  @Input()
  public errorMessage?: string;

  @Input()
  public successMessage?: string;

  @ContentChild(TableRowActionExecutingDirective)
  private readonly executingDirective?: TableRowActionExecutingDirective;
  private _currentStatus: TableRowActionStatus = TableRowActionStatus.DONE;

  private readonly actionMethodList: Array<TableRowActionMethod<Data>>;

  constructor(
    @Inject(RXAP_TABLE_ROW_ACTION_METHOD)
      actionMethodList:
      | Array<TableRowActionMethod<Data>>
      | TableRowActionMethod<Data>,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Inject(ViewContainerRef)
    private readonly vcr: ViewContainerRef,
    @Inject(TableDataSourceDirective)
    private readonly tableDataSourceDirective: TableDataSourceDirective,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
    @Optional()
    @Inject(MatButton)
    private readonly matButton: MatButton | null
  ) {
    this.actionMethodList = coerceArray(actionMethodList);
  }

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
    try {
      await Promise.all(
        this.getElementList().map((element) => {
          return Promise.all([
            Promise.all(
              this.findUntypedActionMethod().map((am) =>
                am.call({ element, type: this.type })
              )
            ),
            Promise.all(
              this.findTypedActionMethod().map((am) => am.call(element))
            )
          ]);
        })
      );
      this.setStatus(TableRowActionStatus.SUCCESS);
    } catch (e) {
      console.error(`Failed to execute row action: ${e.message}`);
      this.setStatus(TableRowActionStatus.ERROR);
    }
  }

  protected getElementList(): Data[] {
    return [ this.element ];
  }

  /**
   * find all method instance in the actionMethodList member that
   * do not have a @TableActionMethod decorators
   * @private
   */
  private findUntypedActionMethod(): Array<TableRowActionTypeSwitchMethod<Data>> {
    return this.actionMethodList.filter(IsTableRowActionTypeSwitchMethod);
  }

  /**
   * find all method instance in the actionMethodList member that
   * do have a @TableActionMethod decorators with the current type
   * @private
   */
  private findTypedActionMethod(): Array<TableRowActionTypeMethod<Data>> {
    return this.actionMethodList.filter(IsTableRowActionTypeMethod(this.type));
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
      case TableRowActionStatus.SUCCESS:
        this.tableDataSourceDirective.refresh();
        if (this.successMessage) {
          this.snackBar.open(this.successMessage, 'ok', { duration: 2560 });
        }
        this.setStatus(TableRowActionStatus.DONE);
        break;
      case TableRowActionStatus.ERROR:
        this.setStatus(TableRowActionStatus.DONE);
        if (this.errorMessage) {
          this.snackBar.open(this.errorMessage, 'ok', { duration: 5120 });
        }
        break;
      case TableRowActionStatus.DONE:
        this.setButtonEnabled();
        this.executingDirective?.hide();
        break;
    }
    this.cdr.detectChanges();
  }
}
