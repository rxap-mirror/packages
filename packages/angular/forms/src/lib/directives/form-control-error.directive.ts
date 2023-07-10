import {
  Directive,
  Host,
  Input,
  OnDestroy,
  OnInit,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ValidationErrors } from '../types';
import { ControlContainer } from '@angular/forms';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  filter,
  startWith,
  tap,
} from 'rxjs/operators';

/**
 * @deprecated removed use the rxapControlError or rxapControlErrors directive
 */
@Directive({
  selector: '[rxapFormControlError]',
  standalone: true,
})
export class FormControlErrorDirective implements OnInit, OnDestroy {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapFormControlErrorFrom')
  @Required
  public name!: string;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapFormControlErrorIf')
  @Required
  public errorKey!: string;

  private subscription?: Subscription;

  constructor(
    private readonly template: TemplateRef<{ $implicit: ValidationErrors }>,
    @Host() @SkipSelf() private readonly parent: ControlContainer,
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  public ngOnInit() {
    const control = this.parent.control?.get(this.name);

    if (!control) {
      throw new Error('Could not extract form control instance');
    }

    this.subscription = control.statusChanges.pipe(
      startWith(control.status),
      filter(status => status === 'INVALID'),
      tap(() => {
        this.viewContainerRef.clear();
        if (control.hasError(this.errorKey)) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: control.getError(this.errorKey) });
        }
      }),
    ).subscribe();

  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
