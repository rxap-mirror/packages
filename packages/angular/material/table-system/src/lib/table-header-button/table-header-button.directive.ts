import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  isDevMode,
  OnInit,
  Optional,
} from '@angular/core';
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

  @Input({
    required: true,
    alias: 'rxapTableHeaderButton',
  })
  public tableDataSourceDirective!: TableDataSourceDirective<Data>;

  @Input()
  public errorMessage?: string;
  @Input()
  public successMessage?: string;
  /**
   * true - after the action is executed the table datasource is refreshed
   */
  @Input()
  public refresh?: boolean;

  protected options: TableHeaderButtonMethodOptions | null = null;
  private _actionDisabled = false;
  private _currentStatus: TableHeaderButtonActionStatus = TableHeaderButtonActionStatus.DONE;

  constructor(
    @Inject(Overlay)
      overlay: Overlay,
    @Inject(ElementRef)
      elementRef: ElementRef,
    @Inject(TABLE_HEADER_BUTTON_METHOD)
    private readonly method: Method,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
    @Optional()
    @Inject(MatTooltip)
    private readonly matTooltip: MatTooltip | null,
    @Optional()
    @Inject(MatMiniFabButton)
    private readonly matButton: MatMiniFabButton | null,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
  ) {
    super(overlay, elementRef);
  }

  private _hasConfirmDirective = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
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
      this.refresh ??= this.options.refresh ?? false;
      this.errorMessage ??= this.options.errorMessage ?? undefined;
      this.successMessage ??= this.options.successMessage ?? undefined;
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
    switch (status) {
      case TableHeaderButtonActionStatus.EXECUTING:
        this.setButtonDisabled();
        break;
      case TableHeaderButtonActionStatus.SUCCESS:
        if (this.refresh) {
          this.tableDataSourceDirective.refresh();
        }
        if (this.successMessage) {
          this.snackBar.open(this.successMessage, 'ok', { duration: 2560 });
        }
        this.setStatus(TableHeaderButtonActionStatus.DONE);
        break;
      case TableHeaderButtonActionStatus.ERROR:
        this.setStatus(TableHeaderButtonActionStatus.DONE);
        if (this.errorMessage) {
          this.snackBar.open(this.errorMessage, 'ok', { duration: 5120 });
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


