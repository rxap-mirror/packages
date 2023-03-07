import { NgControl } from "@angular/forms";
import { MatFormField } from '@angular/material/form-field';
import { RxapFormControl } from '@rxap/forms';

export class ExtractControlMixin {

  protected ngControl!: NgControl | null;

  protected readonly matFormField!: MatFormField | null;

  protected control?: RxapFormControl;

  protected extractControl(ngControl: NgControl | null = this.ngControl ?? this.matFormField?._control?.ngControl ?? null): RxapFormControl {

    if (!ngControl) {
      throw new Error('The ngControl is not defined!');
    }

    this.ngControl = ngControl;

    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

    return this.control = control;
  }

}
