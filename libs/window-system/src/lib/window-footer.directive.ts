import {
  Directive,
  Inject,
  TemplateRef,
  OnInit,
  NgModule,
  ViewContainerRef
} from '@angular/core';
import { WindowRef } from './window-ref';
import { RXAP_WINDOW_REF } from './tokens';
import { TemplatePortal } from '@angular/cdk/portal';

export interface WindowFooterTemplateContext {
  $implicit: WindowRef;
}

@Directive({
  selector: '[rxapWindowFooter]',
})
export class WindowFooterDirective implements OnInit {

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard(dir: WindowFooterTemplateContext, ctx: any):
    ctx is WindowFooterTemplateContext {
    return true;
  }

  constructor(
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<WindowFooterTemplateContext>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
  ) { }

  public ngOnInit() {
    this.windowRef.setFooterPortal(new TemplatePortal<WindowFooterTemplateContext>(
      this.template,
      this.viewContainerRef,
      {
        $implicit: this.windowRef,
      }
    ));
  }

}

@NgModule({
  declarations: [WindowFooterDirective],
  exports: [WindowFooterDirective]
})
export class WindowFooterDirectiveModule {}
