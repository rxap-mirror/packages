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
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[rxapFormSubmitSuccessful]'
})
export class FormSubmitSuccessfulDirective implements AfterViewInit, OnDestroy {

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Inject(TemplateRef) private readonly template: TemplateRef<{ $implicit: any }>,
    @Inject(ViewContainerRef) private readonly viewContainerRef: ViewContainerRef
  ) {}

  public ngAfterViewInit() {
    this.subscription = this.formDirective.submitSuccessful$.pipe(
      tap(result => {
        this.viewContainerRef.clear();
        this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
      })
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
