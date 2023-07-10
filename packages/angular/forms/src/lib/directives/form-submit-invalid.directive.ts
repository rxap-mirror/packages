import {
  Directive,
  Inject,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {FormDirective} from './form.directive';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

@Directive({
  selector: '[rxapFormSubmitInvalid]',
  standalone: true,
})
export class FormSubmitInvalidDirective implements AfterViewInit, OnDestroy {

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Inject(TemplateRef) private readonly template: TemplateRef<{ $implicit: any }>,
    @Inject(ViewContainerRef) private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  public ngAfterViewInit() {
    this.subscription = this.formDirective.invalidSubmit.pipe(
      tap(result => {
        this.viewContainerRef.clear();
        this.viewContainerRef.createEmbeddedView(this.template, {$implicit: result});
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
