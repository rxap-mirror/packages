import {
  Directive,
  Inject,
  InjectionToken,
  Output,
  EventEmitter,
  HostBinding,
  Input,
  Injector,
  INJECTOR,
  OnDestroy,
  NgModule,
  Optional,
  isDevMode,
} from '@angular/core';
import { Constructor, Required, IconConfig } from '@rxap/utilities';
import { FormDefinition, ToFormMethod, FormType } from '@rxap/forms';
import { FormWindowService } from './form-window.service';
import { WindowRef } from '@rxap/window-system';
import { ConfirmClick } from '@rxap/directives';

/**
 * @deprecated
 */
export const RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR = new InjectionToken(
  'rxap/window-form-system/open-form-constructor'
);

/**
 * @deprecated
 */
@Directive({
  selector: '[rxapOpenForm]',
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  },
})
export class OpenFormDirective<Data, Result = Data>
  extends ConfirmClick
  implements OnDestroy
{
  @HostBinding('attr.type')
  @Input()
  public type = 'button';

  @Output()
  public submitted = new EventEmitter<Result>();

  @Input('rxapOpenForm')
  public set formDefinitionConstructor(value: Constructor<FormType<any>> | '') {
    if (value) {
      this._formDefinitionConstructor = value;
    }
  }

  @Input()
  public initial?: Data;

  private _formWindowRef?: WindowRef;

  @Required
  private _formDefinitionConstructor!: Constructor<FormType<any>>;

  @Input()
  public title?: string;

  @Input()
  public icon?: IconConfig;

  @Input()
  public width?: string;

  @Input()
  public height?: string;

  @Input()
  public resizeable?: boolean;

  @Input()
  public draggable?: boolean;

  @Input()
  public panelClass?: string;

  constructor(
    @Optional()
    @Inject(RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR)
    formDefinitionConstructor: Constructor<FormType<any>> | null,
    @Inject(FormWindowService)
    private readonly formWindowService: FormWindowService,
    @Inject(INJECTOR)
    private readonly injector: Injector
  ) {
    super();
    if (formDefinitionConstructor) {
      this._formDefinitionConstructor = formDefinitionConstructor;
    }
  }

  @Input()
  public onSubmit(value: Data): any | Promise<any> {
    if (isDevMode()) {
      console.warn('[rxapOpenForm] No "onSubmit" method is provided!');
    }
    return value;
  }

  protected execute() {
    this._formWindowRef = this.formWindowService.open(
      this._formDefinitionConstructor,
      {
        injector: this.injector,
        submitSuccessfulMethod: ToFormMethod(
          this.onSubmitSuccessful.bind(this)
        ),
        initial: this.initial,
        injectorName: 'OpenFormDirective',
        title: this.title,
        icon: this.icon,
        width: this.width,
        resizeable: this.resizeable,
        draggable: this.draggable,
        panelClass: this.panelClass,
      }
    );
  }

  public onSubmitSuccessful(result: Result): void {
    this.submitted.emit(result);
    this._formWindowRef?.close();
  }

  public ngOnDestroy() {
    this._formWindowRef?.close();
  }
}

/**
 * @deprecated
 */
@NgModule({
  exports: [OpenFormDirective],
  declarations: [OpenFormDirective],
})
export class OpenFormDirectiveModule {}
