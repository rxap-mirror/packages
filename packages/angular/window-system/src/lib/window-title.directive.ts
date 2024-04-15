import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  inject,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { RXAP_WINDOW_REF } from './tokens';
import { WindowRef } from './window-ref';

export interface WindowTitleTemplateContext {
  $implicit: WindowRef;
}

@Directive({
  selector: '[rxapWindowTitle]',
  standalone: true,
})
export class WindowTitleDirective implements OnInit {

  private readonly windowRef: WindowRef = inject(RXAP_WINDOW_REF);
  private readonly template: TemplateRef<WindowTitleTemplateContext> = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

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


