import {
  Directive,
  Inject,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { FormDirective } from './form.directive';
import { Subscription } from 'rxjs';
import {
  tap,
  distinctUntilChanged
} from 'rxjs/operators';

@Directive({
  selector:   '[rxapFormSubmitting]',
  standalone: true
})
export class FormSubmittingDirective implements AfterViewInit, OnDestroy {

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Inject(TemplateRef) private readonly template: TemplateRef<void>,
    @Inject(ViewContainerRef) private readonly viewContainerRef: ViewContainerRef
  ) {}

  public ngAfterViewInit() {
    this.subscription = this.formDirective.submitting$.pipe(
      distinctUntilChanged(),
      tap(loading => {
        this.viewContainerRef.clear();
        if (loading) {
          this.viewContainerRef.createEmbeddedView(this.template);
        }
      })
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
