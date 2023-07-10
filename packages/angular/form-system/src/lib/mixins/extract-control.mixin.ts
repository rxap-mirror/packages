import {AbstractControlDirective, NgControl} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {RxapFormControl} from '@rxap/forms';

export class ExtractControlMixin {

  protected ngControl!: NgControl | null;

  protected readonly matFormField!: MatFormField | null;

  protected control?: RxapFormControl;

  protected extractControl(ngControl: AbstractControlDirective | null = this.ngControl ?? this.matFormField?._control?.ngControl ?? null): RxapFormControl {

    if (!ngControl) {
      throw new Error('The ngControl is not defined!');
    }

    if (!(ngControl instanceof NgControl)) {
      throw new Error('The AbstractControlDirective is not a NgControl!');
    }

    this.ngControl = ngControl;

    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

    return this.control = control;
  }

}
