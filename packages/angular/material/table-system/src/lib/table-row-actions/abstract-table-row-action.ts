import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  ContentChild,
  ElementRef,
  HostListener,
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Input,
  isDevMode,
  OnInit,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmDirective } from '@rxap/components';
import {
  coerceArray,
  coerceBoolean,
} from '@rxap/utilities';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { TableActionMethodOptions } from './decorators';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import { TableRowActionStatus } from './table-row-action-status';
import {
  GetTableRowActionMetadata,
  IsTableRowActionTypeMethod,
  IsTableRowActionTypeSwitchMethod,
} from './table-row-action.method';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
import {
  TableRowActionMethod,
  TableRowActionTypeMethod,
  TableRowActionTypeSwitchMethod,
} from './types';

@Injectable()
export abstract class AbstractTableRowAction<Data extends Record<string, any>> extends ConfirmDirective
  implements OnInit {
  public abstract type: string;
  @Input()
  public errorMessage?: string;
  @Input()
  public successMessage?: string;
  /**
   * true - after the action is executed the table datasource is refreshed
   */
  @Input()
  public refresh?: boolean;

  @Input()
  public color?: ThemePalette;

  protected options: TableActionMethodOptions | null = null;
  @ContentChild(TableRowActionExecutingDirective)
  private readonly executingDirective?: TableRowActionExecutingDirective;
  private _currentStatus: TableRowActionStatus = TableRowActionStatus.DONE;
  private readonly actionMethodList: Array<TableRowActionMethod<Data>>;
  private _actionDisabled = false;

  constructor(
    @Inject(Overlay)
      overlay: Overlay,
    @Inject(ElementRef)
      elementRef: ElementRef,
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
    @Inject(MatIconButton)
    private matButton: MatIconButton | null,
    @Optional()
    @Inject(MatTooltip)
    private matTooltip: MatTooltip | null,
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) {
    super(overlay, elementRef);
    this.actionMethodList = coerceArray(actionMethodList);
  }

  private _hasConfirmDirective = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  ngOnInit() {
    this.options = this.getTableActionOptions();
    if (this.options) {
      this.refresh ??= this.options.refresh ?? false;
      this.errorMessage ??= this.options.errorMessage ?? undefined;
      this.successMessage ??= this.options.successMessage ?? undefined;
      if (this.matTooltip && this.options.tooltip) {
        this.matTooltip.message = this.options.tooltip;
      }
      this.color ??= this.options.color ?? undefined;
    }
    if (this.matButton) {
      if (this.color) {
        this.matButton.color = this.color;
      }
    }
  }

  @HostListener('confirmed')
  public override onConfirmed() {
    return this.execute();
  }

  @HostListener('click', [ '$event' ])
  public override onClick($event: Event) {
    $event.stopPropagation();
    if (!this._hasConfirmDirective && !this.options?.confirm) {
      return this.execute();
    } else if (this.options?.confirm) {
      this.openConfirmOverly();
    } else {
      if (isDevMode()) {
        console.debug('skip remote method call. Wait for confirmation.');
      }
    }
    return Promise.resolve();
  }

  public async execute(): Promise<void> {
    if (this._actionDisabled) {
      return Promise.resolve();
    }
    this.setStatus(TableRowActionStatus.EXECUTING);
    try {
      await Promise.all(
        this.getElementList().map((element) => {
          return Promise.all([
            Promise.all(
              this.findUntypedActionMethod().map((am) => {
                  return am.call({
                    element,
                    type: this.type,
                  });
                },
              ),
            ),
            Promise.all(
              this.findTypedActionMethod().map((am) => {
                return am.call(element);
              }),
            ),
          ]);
        }),
      );
      this.setStatus(TableRowActionStatus.SUCCESS);
    } catch (e: any) {
      console.error(`Failed to execute row action: ${ e.message }`);
      this.setStatus(TableRowActionStatus.ERROR);
    }
  }

  protected abstract getElementList(): Data[];

  /**
   * Disables the action. If the button is pressed the action is NOT executed
   *
   * Hint: the button is set to disabled = true to prevent any conflict with
   * extern button enable features linke : rxapHasEnablePermission
   * @protected
   */
  protected setButtonDisabled() {
    this._actionDisabled = true;
  }

  /**
   * Enables the action. If the button is pressed the action is executed
   *
   * TODO : find a way to communicate the disabled state between the features
   * Hint: the button is set to disabled = false to prevent any conflict with
   * extern button enable features linke : rxapHasEnablePermission
   * @protected
   */
  protected setButtonEnabled() {
    this._actionDisabled = false;
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
        if (this.refresh) {
          this.tableDataSourceDirective.refresh();
        }
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

  private getTableActionOptions(): TableActionMethodOptions | null {
    const metadataList = this.actionMethodList.map(actionMethod => GetTableRowActionMetadata(actionMethod));
    if (metadataList.length === 0) {
      return null;
    }
    // TODO : handle multiple metadata or not exist metadata
    return metadataList.filter(metadata => metadata.type === this.type)
                       .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0];
  }

}
