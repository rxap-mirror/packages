import { AfterViewInit, ChangeDetectorRef, Directive, inject, OnDestroy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RxapFormArray } from '@rxap/forms';
import {
  Subscription,
  tap,
} from 'rxjs';

// TODO : move to rxap packages
@Directive({
  selector: '[rxapFormArrayItemAddButton]',
  standalone: true,
  host: {
    'type': 'button',
    '[disabled]': 'disabled',
    '(click)': 'onClick()',
  },
})
export class FormArrayAddItemButtonDirective implements AfterViewInit, OnDestroy {
  protected readonly parent = inject(ControlContainer, { skipSelf: true });
  protected readonly matButton = inject(MatButton, { optional: true });
  protected readonly cdr = inject(ChangeDetectorRef);


  readonly type = 'button';
  protected formArray!: RxapFormArray;
  private _controlDisabledSubscription?: Subscription;

  get disabled() {
    return this.isDisabled;
  }

  protected get isDisabled(): boolean {
    return !!this.formArray?.disabled;
  }

  ngAfterViewInit() {
    if (this.parent.control instanceof RxapFormArray) {
      this.formArray = this.parent.control;
    }
    const matButton = this.matButton;
    if (matButton || this.formArray) {
      // the disabled host binding must be refreshed if the control state changes outside of a template event (zoneless)
      this._controlDisabledSubscription = this.formArray.disabled$.pipe(
        tap(isDisabled => {
          if (matButton) {
            matButton.disabled = isDisabled;
          }
          this.cdr.markForCheck();
        }),
      ).subscribe();
    }
  }

  ngOnDestroy() {
    this._controlDisabledSubscription?.unsubscribe();
  }

  protected onClick() {
    this.formArray.insertAt();
  }

}
