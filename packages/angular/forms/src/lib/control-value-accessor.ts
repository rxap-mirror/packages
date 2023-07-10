import {ControlValueAccessor as NgControlValueAccessor} from '@angular/forms';

export abstract class ControlValueAccessor<T = any> implements NgControlValueAccessor {
  abstract writeValue(value: T): void;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange? = (value: T | null) => {
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched? = () => {
  };

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDisabledState? = (isDisabled: boolean) => {
  };

}
