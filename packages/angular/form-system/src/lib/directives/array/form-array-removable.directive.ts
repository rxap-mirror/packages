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

  protected formGroup!: RxapFormGroup<{ deleted: boolean }>;

  protected deletedControl!: RxapFormControl<boolean>;
  private _deletedControlValueSubscription?: Subscription;

  constructor(@Optional() protected readonly parent: ControlContainer) {
  }

  get isDeleted(): boolean {
    return this.deletedControl.value;
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
      if (!(this.formGroup.parent instanceof UntypedFormArray)) {
        throw new Error(`The parent of the FormGroup is not a FormArray instance`);
      }
    } else {
      throw new Error(`The parent is not a form group instance`);
    }
    this._deletedControlValueSubscription = this.deletedControl.value$.pipe(
      tap((isDeleted) => {
        for (const [ name, control ] of Object.entries(this.formGroup.controls)) {
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


