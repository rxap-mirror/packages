import { AfterViewInit, Directive, OnDestroy, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormSubmitInvalid]',
  standalone: true,
})
export class FormSubmitInvalidDirective implements AfterViewInit, OnDestroy {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<{
    $implicit: any;
}>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);


  private subscription?: Subscription;

  public ngAfterViewInit() {
    this.subscription = this.formDirective.invalidSubmit.pipe(
      tap(result => {
        this.viewContainerRef.clear();
        this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
