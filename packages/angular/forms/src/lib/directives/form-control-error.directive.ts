import { Directive, effect, inject, input, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import {
  startWith,
  tap,
} from 'rxjs/operators';
import { ValidationErrors } from '../types';

/**
 * @deprecated removed use the rxapControlError or rxapControlErrors directive
 */
@Directive({
  selector: '[rxapFormControlError]',
  standalone: true,
})
export class FormControlErrorDirective {
  private readonly template = inject<TemplateRef<{
    $implicit: ValidationErrors;
}>>(TemplateRef);
  private readonly parent = inject(ControlContainer, { host: true, skipSelf: true });
  private readonly viewContainerRef = inject(ViewContainerRef);


  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly name = input.required<string>({ alias: "rxapFormControlErrorFrom" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly errorKey = input.required<string>({ alias: "rxapFormControlErrorIf" });

  constructor() {
    effect((onCleanup) => {
      const name = this.name();
      const errorKey = this.errorKey();
      untracked(() => {
        const control = this.parent.control?.get(name);

        if (!control) {
          throw new Error('Could not extract form control instance');
        }

        const subscription = control.statusChanges.pipe(
          startWith(control.status),
          tap(() => {
            this.viewContainerRef.clear();
            if (control.hasError(errorKey)) {
              this.viewContainerRef.createEmbeddedView(this.template, { $implicit: control.getError(errorKey) });
            }
          }),
        ).subscribe();
        onCleanup(() => {
          subscription.unsubscribe();
          this.viewContainerRef.clear();
        });
      });
    });
  }

}
