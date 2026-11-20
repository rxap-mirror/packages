import { Directive, OnDestroy, OnInit, OutputRefSubscription, inject } from '@angular/core';
import { FormSubmitDirective } from '@rxap/forms';
import type { WindowRef } from '@rxap/window-system';
import { RXAP_WINDOW_REF } from '@rxap/window-system';

@Directive({
  selector: '[rxapFormSubmit][rxapCloseWindowAfterSubmit]',
  standalone: true,
})
export class CloseWindowAfterSubmitDirective implements OnInit, OnDestroy {
  private readonly formSubmit = inject<FormSubmitDirective>(FormSubmitDirective);
  private readonly windowRef = inject<WindowRef>(RXAP_WINDOW_REF);

  private _subscription?: OutputRefSubscription;

  public ngOnInit() {
    this._subscription = this.formSubmit.afterSubmit.subscribe(() => this.windowRef.complete());
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}


