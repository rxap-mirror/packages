import {
  Directive,
  Host,
  OnDestroy,
  OnInit,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  input
} from '@angular/core';
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

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly name = input.required<string>({ alias: "rxapFormControlErrorFrom" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly errorKey = input.required<string>({ alias: "rxapFormControlErrorIf" });

  private subscription?: Subscription;

  constructor(
    private readonly template: TemplateRef<{ $implicit: ValidationErrors }>,
    @Host() @SkipSelf() private readonly parent: ControlContainer,
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

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
