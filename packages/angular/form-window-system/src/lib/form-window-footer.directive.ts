import {
  Directive,
  Inject,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  RXAP_WINDOW_REF,
  WindowRef,
} from '@rxap/window-system';
import {
  FormDefinition,
  FormDirective,
} from '@rxap/forms';
import { TemplatePortal } from '@angular/cdk/portal';

export interface FormWindowFooterTemplateContext<Data = any> {
  $implicit: WindowRef;
  formDirective: FormDirective<Data>;
  formDefinition: FormDefinition<Data>;
}

@Directive({
  selector: '[rxapFormWindowFooter]',
  standalone: true,
})
export class FormWindowFooterDirective<Data> implements OnInit {

  constructor(
    @Inject(FormDirective)
    private readonly formDirective: FormDirective<Data>,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef<Data>,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<FormWindowFooterTemplateContext<Data>>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(dir: FormWindowFooterDirective<T>, ctx: any):
    ctx is FormWindowFooterTemplateContext<T> {
    return true;
  }

  public ngOnInit() {
    this.windowRef.setFooterPortal(new TemplatePortal<FormWindowFooterTemplateContext<Data>>(
      this.template,
      this.viewContainerRef,
      {
        $implicit: this.windowRef,
        formDefinition: this.formDirective.formDefinition,
        formDirective: this.formDirective,
      },
    ));
  }

}


