import {
  AfterViewInit,
  Directive,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { FormDirective } from './form.directive';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[rxapFormLoadingError]',
  standalone: true,
})
export class FormLoadingErrorDirective implements AfterViewInit, OnDestroy {

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Inject(TemplateRef) private readonly template: TemplateRef<{ $implicit: Error }>,
    @Inject(ViewContainerRef) private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  public ngAfterViewInit() {
    this.subscription = this.formDirective.loadingError$.pipe(
      tap(error => {
        this.viewContainerRef.clear();
        if (error !== null) {
          this.viewContainerRef.createEmbeddedView(this.template, {$implicit: error});
        }
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
