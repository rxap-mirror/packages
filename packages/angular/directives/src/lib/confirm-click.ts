import {
  Directive,
  input,
} from '@angular/core';
import { coerceBoolean } from '@rxap/utilities';

@Directive({
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  },
})
export abstract class ConfirmClick {

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

  public onClick() {
    if (!this.hasConfirmDirective()) {
      this.execute();
    }
  }

  public onConfirm() {
    this.execute();
  }

  protected abstract execute(): void;

}
