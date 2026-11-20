import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, isDevMode, OnInit, input, inject } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmDirective } from '@rxap/components';
import { Method } from '@rxap/pattern';
import { coerceBoolean } from '@rxap/utilities';
import { TableDataSourceDirective } from '../table-data-source.directive';
import {
  GetTableHeaderButtonMetadata,
  TableHeaderButtonMethodOptions,
} from './decorators';
import { TableHeaderButtonActionStatus } from './table-header-button-action-status';
import { TABLE_HEADER_BUTTON_METHOD } from './tokens';

@Directive({
  selector: 'button[mat-mini-fab][rxapTableHeaderButton]',
  standalone: true,
})
export class TableHeaderButtonDirective<Data extends Record<string, any>> extends ConfirmDirective
  implements OnInit {
  private readonly method = inject<Method>(TABLE_HEADER_BUTTON_METHOD);
  private readonly snackBar = inject<MatSnackBar>(MatSnackBar);
  private readonly matTooltip = inject<MatTooltip | null>(MatTooltip, { optional: true });
  private readonly matButton = inject<MatMiniFabButton | null>(MatMiniFabButton, { optional: true });
  protected readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);


  public readonly tableDataSourceDirective = input.required<TableDataSourceDirective<Data>>({ alias: "rxapTableHeaderButton" });

  public readonly errorMessage = input<string>();
  public readonly successMessage = input<string>();
  /**
   * true - after the action is executed the table datasource is refreshed
   */
  public readonly refresh = input<boolean>();

  protected options: TableHeaderButtonMethodOptions | null = null;
  private _actionDisabled = false;
  private _currentStatus: TableHeaderButtonActionStatus = TableHeaderButtonActionStatus.DONE;

  constructor() {
    const overlay = inject<Overlay>(Overlay);
    const elementRef = inject<ElementRef>(ElementRef);

    super(overlay, elementRef);
  }

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

  @HostListener('confirmed')
  public override onConfirmed() {
    return this.execute();
  }

  @HostListener('click', [ '$event' ])
  public override onClick($event: Event) {
    $event.stopPropagation();
    if (!this.hasConfirmDirective() && !this.options?.confirm) {
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
    this.setStatus(TableHeaderButtonActionStatus.EXECUTING);
    try {
      await this.method.call();
      this.setStatus(TableHeaderButtonActionStatus.SUCCESS);
    } catch (e: any) {
      console.error(`Failed to execute table header action: ${ e.message }`);
      this.setStatus(TableHeaderButtonActionStatus.ERROR);
    }
  }

  ngOnInit() {
    this.options = this.getTableHeaderButtonOptions();
    if (this.options) {
      this.refresh() ??= this.options.refresh ?? false;
      this.errorMessage() ??= this.options.errorMessage ?? undefined;
      this.successMessage() ??= this.options.successMessage ?? undefined;
      if (this.matTooltip && this.options.tooltip) {
        this.matTooltip.message = this.options.tooltip;
      }
    }
  }

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

  private setStatus(status: TableHeaderButtonActionStatus) {
    if (this._currentStatus === status) {
      return;
    }
    this._currentStatus = status;
    const errorMessage = this.errorMessage();
    const successMessage = this.successMessage();
    switch (status) {
      case TableHeaderButtonActionStatus.EXECUTING:
        this.setButtonDisabled();
        break;
      case TableHeaderButtonActionStatus.SUCCESS:
        if (this.refresh()) {
          this.tableDataSourceDirective().refresh();
        }
        if (successMessage) {
          this.snackBar.open(successMessage, 'ok', { duration: 2560 });
        }
        this.setStatus(TableHeaderButtonActionStatus.DONE);
        break;
      case TableHeaderButtonActionStatus.ERROR:
        this.setStatus(TableHeaderButtonActionStatus.DONE);
        if (errorMessage) {
          this.snackBar.open(errorMessage, 'ok', { duration: 5120 });
        }
        break;
      case TableHeaderButtonActionStatus.DONE:
        this.setButtonEnabled();
        break;
    }
    this.cdr.detectChanges();
  }

  private getTableHeaderButtonOptions(): TableHeaderButtonMethodOptions {
    return GetTableHeaderButtonMetadata(this.method);
  }

}


