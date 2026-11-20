import {
  computed,
  Directive,
  effect,
  INJECTOR,
  Injector,
  input,
  contentChild,
  inject,
  isDevMode,
  Renderer2,
  Signal,
  ViewContainerRef,
  untracked,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmDirective } from '@rxap/components';
import {
  coerceArray,
  coerceBoolean,
  dasherize,
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

/**
 * Subclasses must be decorated with @Directive, declare the `type` signal input and
 * implement `getElementList`. No constructor arguments are required anymore - all
 * dependencies are acquired with inject().
 */
@Directive()
export abstract class AbstractTableRowAction<Data extends Record<string, any>> extends ConfirmDirective {
  public abstract readonly type: Signal<string>;
  public readonly errorMessage = input<string>();
  public readonly successMessage = input<string>();
  /**
   * true - after the action is executed the table datasource is refreshed
   */
  public readonly refresh = input<boolean>();

  public readonly color = input<ThemePalette>();

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

  public readonly isHeader: boolean = false;

  protected readonly renderer = inject(Renderer2);
  protected readonly vcr = inject(ViewContainerRef);
  protected readonly tableDataSourceDirective = inject(TableDataSourceDirective);
  protected readonly snackBar = inject(MatSnackBar);
  protected readonly matButton: MatIconButton | MatButton | null = inject(MatIconButton, { optional: true }) ??
    inject(MatButton, { optional: true });
  protected readonly matTooltip = inject(MatTooltip, { optional: true });
  protected readonly injector = inject<Injector>(INJECTOR);
  private readonly actionMethodList: Array<TableRowActionMethod<Data>> = coerceArray(
    inject<Array<TableRowActionMethod<Data>> | TableRowActionMethod<Data>>(RXAP_TABLE_ROW_ACTION_METHOD),
  );

  protected readonly options: Signal<TableActionMethodOptions | null> = computed(() => this.getTableActionOptions());

  protected readonly effectiveRefresh = computed(() => this.refresh() ?? this.options()?.refresh ?? false);
  protected readonly effectiveErrorMessage = computed(() => this.errorMessage() ?? this.options()?.errorMessage ?? undefined);
  protected readonly effectiveSuccessMessage = computed(() => this.successMessage() ?? this.options()?.successMessage ?? undefined);
  protected readonly effectiveColor = computed(() => this.color() ?? this.options()?.color ?? undefined);

  private readonly executingDirective = contentChild(TableRowActionExecutingDirective);
  private _currentStatus: TableRowActionStatus = TableRowActionStatus.DONE;
  private _actionDisabled = false;

  protected constructor() {
    super();
    effect(() => {
      const tooltip = this.options()?.tooltip;
      if (this.matTooltip && tooltip) {
        untracked(() => this.matTooltip!.message = tooltip);
      }
    });
    effect(() => {
      const color = this.effectiveColor();
      if (this.matButton && color) {
        untracked(() => this.matButton!.color = color);
      }
    });
    effect(() => {
      const type = this.type();
      const element = this.elementRef.nativeElement;
      untracked(() => {
        this.renderer.addClass(element, this.isHeader ? 'rxap-table-row-header-action' : 'rxap-table-row-action');
        this.renderer.addClass(element, `rxap-action-${ dasherize(type) }`);
      });
    });
  }

  public override onConfirmed() {
    return this.execute();
  }

  public override onClick($event?: Event) {
    $event?.stopPropagation();
    if (!this.hasConfirmDirective() && !this.options()?.confirm) {
      return this.execute();
    } else if (this.options()?.confirm) {
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
                    type: this.type(),
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
    return this.actionMethodList.filter(IsTableRowActionTypeMethod(this.type()));
  }

  private setStatus(status: TableRowActionStatus) {
    if (this._currentStatus === status) {
      return;
    }
    this._currentStatus = status;
    const errorMessage = this.effectiveErrorMessage();
    const successMessage = this.effectiveSuccessMessage();
    switch (status) {
      case TableRowActionStatus.EXECUTING:
        this.setButtonDisabled();
        this.executingDirective()?.show();
        break;
      case TableRowActionStatus.SUCCESS:
        if (this.effectiveRefresh()) {
          this.tableDataSourceDirective.refresh();
        }
        if (successMessage) {
          this.snackBar.open(successMessage, 'ok', { duration: 2560 });
        }
        this.setStatus(TableRowActionStatus.DONE);
        break;
      case TableRowActionStatus.ERROR:
        this.setStatus(TableRowActionStatus.DONE);
        if (errorMessage) {
          this.snackBar.open(errorMessage, 'ok', { duration: 5120 });
        }
        break;
      case TableRowActionStatus.DONE:
        this.setButtonEnabled();
        this.executingDirective()?.hide();
        break;
    }
  }

  private getTableActionOptions(): TableActionMethodOptions | null {
    const metadataList = this.actionMethodList.map(actionMethod => GetTableRowActionMetadata(actionMethod));
    if (metadataList.length === 0) {
      return null;
    }
    // TODO : handle multiple metadata or not exist metadata
    return metadataList.filter(metadata => metadata.type === this.type())
                       .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0];
  }

}
