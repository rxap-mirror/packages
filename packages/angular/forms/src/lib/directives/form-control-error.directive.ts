import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef, input, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  filter,
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
export class FormControlErrorDirective implements OnInit, OnDestroy {
  private readonly template = inject<TemplateRef<{
    $implicit: ValidationErrors;
}>>(TemplateRef);
  private readonly parent = inject(ControlContainer, { host: true, skipSelf: true });
  private readonly viewContainerRef = inject(ViewContainerRef);


  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly name = input.required<string>({ alias: "rxapFormControlErrorFrom" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly errorKey = input.required<string>({ alias: "rxapFormControlErrorIf" });

  private subscription?: Subscription;

  public ngOnInit() {
    const control = this.parent.control?.get(this.name());

    if (!control) {
      throw new Error('Could not extract form control instance');
    }

    this.subscription = control.statusChanges.pipe(
      startWith(control.status),
      filter(status => status === 'INVALID'),
      tap(() => {
        this.viewContainerRef.clear();
        const errorKey = this.errorKey();
        if (control.hasError(errorKey)) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: control.getError(errorKey) });
        }
      }),
    ).subscribe();

  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
