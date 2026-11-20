import { AfterViewInit, Directive, OnDestroy, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormLoading]',
  standalone: true,
})
export class FormLoadingDirective implements AfterViewInit, OnDestroy {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<void>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);


  private subscription?: Subscription;

  public ngAfterViewInit() {
    this.subscription = this.formDirective.loading$.pipe(
      distinctUntilChanged(),
      tap(loading => {
        this.viewContainerRef.clear();
        if (loading) {
          this.viewContainerRef.createEmbeddedView(this.template);
        }
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
