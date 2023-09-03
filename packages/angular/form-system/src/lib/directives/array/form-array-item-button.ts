import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  OnDestroy,
  Optional,
  Renderer2,
  SkipSelf,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import {
  Subscription,
  tap,
} from 'rxjs';

// TODO : move to rxap packages
@Directive()
export abstract class FormArrayItemButton implements AfterViewInit, OnDestroy {

  @HostBinding('type')
  type = 'button';
  protected formGroup!: RxapFormGroup<{ deleted: boolean }>;
  protected deletedControl!: RxapFormControl<boolean>;
  private _controlDisabledSubscription?: Subscription;
  private _deletedControlValueSubscription?: Subscription;

  constructor(
    @SkipSelf() protected readonly parent: ControlContainer,
    @Optional() protected readonly matButton: MatButton,
    protected readonly renderer: Renderer2,
    protected readonly elementRef: ElementRef,
  ) {
  }

  @HostBinding('disabled')
  get disabled() {
    return this.isDisabled;
  }

  get isDeleted(): boolean {
    return this.deletedControl.value;
  }

  get index(): number {
    return (this.formGroup.parent as UntypedFormArray).controls.findIndex(control => control === this.formGroup);
  }

  protected get isDisabled(): boolean {
    return !!this.formGroup?.parent?.disabled;
  }

  ngAfterViewInit() {
    if (this.parent.control instanceof RxapFormGroup) {
      this.formGroup = this.parent.control;
      if (this.formGroup.controls.deleted instanceof RxapFormControl) {
        this.deletedControl = this.formGroup.controls.deleted;
      } else {
        throw new Error(`The parent FormGroup instance does not have a 'deleted' control`);
      }
      if (!(this.formGroup.parent instanceof UntypedFormArray)) {
        throw new Error(`The parent of the FormGroup is not a FormArray instance`);
      }
    } else {
      throw new Error(`The parent is not a form group instance`);
    }
    if (this.matButton) {
      this._controlDisabledSubscription = this.formGroup.disabled$.pipe(
        tap(isDisabled => this.matButton.disabled = isDisabled),
      ).subscribe();
    }
    this.deletedControl.value$.pipe(
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
