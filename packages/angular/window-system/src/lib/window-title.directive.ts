import {Directive, Inject, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {WindowRef} from './window-ref';
import {RXAP_WINDOW_REF} from './tokens';
import {TemplatePortal} from '@angular/cdk/portal';

export interface WindowTitleTemplateContext {
  $implicit: WindowRef;
}

@Directive({
  selector: '[rxapWindowTitle]',
  standalone: true,
})
export class WindowTitleDirective implements OnInit {

  constructor(
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<WindowTitleTemplateContext>,
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
  static ngTemplateContextGuard(dir: WindowTitleDirective, ctx: any):
    ctx is WindowTitleTemplateContext {
    return true;
  }

  public ngOnInit() {
    this.windowRef.setTitlePortal(new TemplatePortal<WindowTitleTemplateContext>(
      this.template,
      this.viewContainerRef,
      {
        $implicit: this.windowRef,
      },
    ));
  }

}


