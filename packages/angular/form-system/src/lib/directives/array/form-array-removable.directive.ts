import {
  AfterViewInit,
  Directive,
  OnDestroy,
  Optional,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
} from '@angular/forms';
import {
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import {
  Subscription,
  tap,
} from 'rxjs';

// TODO : move to rxap packages
@Directive({
  selector: '[rxapFormArrayRemovable]',
  standalone: true,
})
export class FormArrayRemovableDirective implements AfterViewInit, OnDestroy {

  protected control!: RxapFormGroup<{ deleted: boolean }>;

  protected deletedControl!: RxapFormControl<boolean>;
  private _deletedControlValueSubscription?: Subscription;

  constructor(@Optional() protected readonly parent: ControlContainer) {
  }

  get isDeleted(): boolean {
    return this.deletedControl.value;
  }

  protected get isDisabled(): boolean {
    return !!this.control?.parent?.disabled;
  }

  ngAfterViewInit() {
    if (this.parent.control instanceof RxapFormGroup) {
      this.control = this.parent.control;
      if (this.control.controls.deleted instanceof RxapFormControl) {
        this.deletedControl = this.control.controls.deleted;
      } else {
        throw new Error(`The parent FormGroup instance does not have a 'deleted' control`);
      }
      if (!(this.control.parent instanceof UntypedFormArray)) {
        throw new Error(`The parent of the FormGroup is not a FormArray instance`);
      }
    } else {
      throw new Error(`The parent is not a form group instance`);
    }
    this._deletedControlValueSubscription = this.deletedControl.value$.pipe(
      tap((isDeleted) => {
        for (const [ name, control ] of Object.entries(this.control.controls)) {
          if (name !== 'deleted') {
            if (isDeleted) {
              control.disable({ onlySelf: true });
            } else if (!this.isDisabled) {
              control.enable({ onlySelf: true });
            }
          }
        }
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this._deletedControlValueSubscription?.unsubscribe();
  }

}


