import { AfterViewInit, Directive, OnDestroy, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormLoadingError]',
  standalone: true,
})
export class FormLoadingErrorDirective implements AfterViewInit, OnDestroy {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<{
    $implicit: Error;
}>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);


  private subscription?: Subscription;

  public ngAfterViewInit() {
    this.subscription = this.formDirective.loadingError$.pipe(
      tap(error => {
        this.viewContainerRef.clear();
        if (error !== null) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: error });
        }
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
