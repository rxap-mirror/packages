import { Directive, NgModule, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormSubmitDirective } from '@rxap/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { WindowRef } from '@rxap/window-system';
import { RXAP_WINDOW_REF } from '@rxap/window-system';

@Directive({
  selector: '[rxapFormSubmit][rxapCloseWindowAfterSubmit]',
})
export class CloseWindowAfterSubmitDirective implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  constructor(
    @Inject(FormSubmitDirective)
    private readonly formSubmit: FormSubmitDirective,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef
  ) {}

  public ngOnInit() {
    this._subscription = this.formSubmit.afterSubmit
      .pipe(tap(() => this.windowRef.complete()))
      .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}

@NgModule({
  declarations: [CloseWindowAfterSubmitDirective],
  exports: [CloseWindowAfterSubmitDirective],
})
export class CloseWindowAfterSubmitDirectiveModule {}
