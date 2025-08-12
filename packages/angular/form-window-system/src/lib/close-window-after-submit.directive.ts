import {
  Directive,
  Inject,
  OnDestroy,
  OnInit,
  OutputRefSubscription,
} from '@angular/core';
import { FormSubmitDirective } from '@rxap/forms';
import type { WindowRef } from '@rxap/window-system';
import { RXAP_WINDOW_REF } from '@rxap/window-system';

@Directive({
  selector: '[rxapFormSubmit][rxapCloseWindowAfterSubmit]',
  standalone: true,
})
export class CloseWindowAfterSubmitDirective implements OnInit, OnDestroy {
  private _subscription?: OutputRefSubscription;

  constructor(
    @Inject(FormSubmitDirective)
    private readonly formSubmit: FormSubmitDirective,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef,
  ) {
  }

  public ngOnInit() {
    this._subscription = this.formSubmit.afterSubmit.subscribe(() => this.windowRef.complete());
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}


