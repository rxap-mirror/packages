import {
  AbstractControl,
  NgControl,
} from '@angular/forms';

export class TestNgControl extends NgControl {

  constructor(private readonly _control: AbstractControl) {
    super();
  }

  override get control(): AbstractControl<any, any> | null {
    return this._control;
  }

  override viewToModelUpdate(newValue: any): void {
    throw new Error('Method not implemented.');
  }

}
