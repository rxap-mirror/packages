import { AfterViewInit, Directive, HostBinding, HostListener, OnDestroy, inject } from '@angular/core';
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
})
export class FormArrayAddItemButtonDirective implements AfterViewInit, OnDestroy {
  protected readonly parent = inject(ControlContainer, { optional: true, skipSelf: true });
  protected readonly matButton = inject(MatButton, { optional: true });


  @HostBinding('type')
  type = 'button';
  protected formArray!: RxapFormArray;
  private _controlDisabledSubscription?: Subscription;

  @HostBinding('disabled')
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
    if (this.matButton) {
      this._controlDisabledSubscription = this.formArray.disabled$.pipe(
        tap(isDisabled => this.matButton.disabled = isDisabled),
      ).subscribe();
    }
  }

  ngOnDestroy() {
    this._controlDisabledSubscription?.unsubscribe();
  }

  @HostListener('click')
  protected onClick() {
    this.formArray.insertAt();
  }

}
