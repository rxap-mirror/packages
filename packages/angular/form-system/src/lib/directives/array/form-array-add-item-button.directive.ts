import { AfterViewInit, ChangeDetectorRef, Directive, inject, OnDestroy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RxapFormArray } from '@rxap/forms';
import {
  Subscription,
  tap,
} from 'rxjs';
import { Showcase } from '@ng-prism/core';

// TODO : move to rxap packages
const PRISM_FORM_ARRAY_TEMPLATE = '<form rxapForm style="display: flex; flex-direction: column; gap: 8px; min-width: 280px"><div formArrayName="items" style="display: flex; flex-direction: column; gap: 8px"><div *rxapForFormArrayItem="let group" [formGroup]="group" style="display: flex; gap: 8px"><input formControlName="label" /><button rxapFormArrayItemRemoveButton>Remove</button></div><div><button rxapFormArrayItemAddButton>Add item</button></div></div></form>';

@Showcase<FormArrayAddItemButtonDirective>({
  title: 'Form Array Add Item Button',
  category: 'Form System',
  description: 'A button that adds a new item to the form array of the parent control container. The demo form has an array of two items, each of them with a remove button.',
  status: 'stable',
  imports: [
    { name: 'ReactiveFormsModule', from: '@angular/forms' },
    { name: 'FormDirective', from: '@rxap/forms' },
  ],
  host: { template: PRISM_FORM_ARRAY_TEMPLATE },
  variants: [
    { name: 'Default' },
  ],
})
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
