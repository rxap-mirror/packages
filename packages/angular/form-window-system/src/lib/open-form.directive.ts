import { Directive, HostBinding, InjectionToken, Injector, INJECTOR, Input, isDevMode, OnDestroy, input, output, inject } from '@angular/core';
import { ConfirmClick } from '@rxap/directives';
import {
  FormType,
  ToFormMethod,
} from '@rxap/forms';
import {
  Constructor,
  IconConfig,
} from '@rxap/utilities';
import { WindowRef } from '@rxap/window-system';
import { FormWindowService } from './form-window.service';

/**
 * @deprecated
 */
export const RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR = new InjectionToken(
  'rxap/window-form-system/open-form-constructor',
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
  standalone: true,
})
export class OpenFormDirective<Data, Result = Data>
  extends ConfirmClick
  implements OnDestroy {
  private readonly formWindowService = inject<FormWindowService>(FormWindowService);
  private readonly injector = inject<Injector>(INJECTOR);

  @HostBinding('attr.type')
public readonly type = input('button');

  public readonly submitted = output<Result>();
  public readonly initial = input<Partial<Data>>();
  public readonly title = input<string>();
  public readonly icon = input<IconConfig>();
  public readonly width = input<string>();
  public readonly height = input<string>();
  public readonly resizeable = input<boolean>();
  public readonly draggable = input<boolean>();
  public readonly panelClass = input<string>();
  private _formWindowRef?: WindowRef;

  constructor() {
    const formDefinitionConstructor = inject<Constructor<FormType<any>> | null>(RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR, { optional: true });

    super();
    if (formDefinitionConstructor) {
      this._formDefinitionConstructor = formDefinitionConstructor;
    }
  }

  private _formDefinitionConstructor!: Constructor<FormType<any>>;

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapOpenForm')
  public set formDefinitionConstructor(value: Constructor<FormType<any>> | '') {
    if (value) {
      this._formDefinitionConstructor = value;
    }
  }

  @Input()
  public onSubmit(value: Data): any | Promise<any> {
    if (isDevMode()) {
      console.warn('[rxapOpenForm] No "onSubmit" method is provided!');
    }
    return value;
  }

  public onSubmitSuccessful(result: Result): void {
    this.submitted.emit(result);
    this._formWindowRef?.close();
  }

  public ngOnDestroy() {
    this._formWindowRef?.close();
  }

  protected execute() {
    this._formWindowRef = this.formWindowService.open(
      this._formDefinitionConstructor,
      {
        injector: this.injector,
        submitSuccessfulMethod: ToFormMethod(
          this.onSubmitSuccessful.bind(this),
        ),
        initial: this.initial(),
        injectorName: 'OpenFormDirective',
        title: this.title(),
        icon: this.icon(),
        width: this.width(),
        resizeable: this.resizeable(),
        draggable: this.draggable(),
        panelClass: this.panelClass(),
      },
    );
  }
}

/**
 * @deprecated
 */

