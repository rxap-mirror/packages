import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import {
  ControlContainer,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  RxapFormArray,
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import {
  Subscription,
  tap,
} from 'rxjs';

// TODO : move to rxap packages
@Directive({
  host: {
    'type': 'button',
    '[disabled]': 'disabled',
    '(click)': 'onClick()',
  },
})
export abstract class FormArrayItemButton implements AfterViewInit, OnDestroy {

  readonly type = 'button';
  protected formGroup!: RxapFormGroup<{ deleted: boolean }>;
  protected formArray!: RxapFormArray;
  protected deletedControl!: RxapFormControl<boolean>;
  private _controlDisabledSubscription?: Subscription;
  private _deletedControlValueSubscription?: Subscription;

  protected readonly parent: ControlContainer = inject(ControlContainer, { skipSelf: true });
  protected readonly matButton: MatButton | null = inject(MatButton, { optional: true });
  protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected readonly renderer: Renderer2 = inject(Renderer2);
  protected readonly elementRef: ElementRef = inject(ElementRef);

  get disabled() {
    return this.isDisabled;
  }

  get isDeleted(): boolean {
    return this.deletedControl.value;
  }

  get index(): number {
    return this.formArray.controls.findIndex(control => control === this.formGroup);
  }

  protected get isDisabled(): boolean {
    return !!this.formGroup?.parent?.disabled;
  }

  ngAfterViewInit() {
    if (this.parent.control instanceof RxapFormGroup) {
      this.formGroup = this.parent.control;
      if (this.formGroup.controls.deleted) {
        if (this.formGroup.controls.deleted instanceof RxapFormControl) {
          this.deletedControl = this.formGroup.controls.deleted;
        } else {
          throw new Error(`The parent FormGroup instance does have a 'deleted' control, but it is not a RxapFormControl instance`);
        }
      } else {
        this.deletedControl = new RxapFormControl(false, { controlId: 'deleted' });
        this.formGroup.addControl('deleted', this.deletedControl);
      }
      if (this.formGroup.parent instanceof RxapFormArray) {
        this.formArray = this.formGroup.parent;
      } else {
        throw new Error(`The parent of the FormGroup is not a RxapFormArray instance`);
      }
    } else {
      throw new Error(`The parent is not a form group instance`);
    }
    const matButton = this.matButton;
    // the disabled host binding must be refreshed if the control state changes outside of a template event (zoneless)
    this._controlDisabledSubscription = this.formGroup.disabled$.pipe(
      tap(isDisabled => {
        if (matButton) {
          matButton.disabled = isDisabled;
        }
        this.cdr.markForCheck();
      }),
    ).subscribe();
    this._deletedControlValueSubscription = this.deletedControl.value$.pipe(
      tap(() => this.updateDisplayStyle()),
    ).subscribe();
  }

  ngOnDestroy() {
    this._controlDisabledSubscription?.unsubscribe();
    this._deletedControlValueSubscription?.unsubscribe();
  }

  protected abstract onClick(): void;

  protected abstract updateDisplayStyle(): void;

}
